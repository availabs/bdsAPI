import time
from fabric.api import *
from fabric.context_managers import cd, settings, quiet
import os
from config import files, db_user
import sqlalchemy
from sqlalchemy import create_engine
import pandas as pd

env.hosts = ['localhost']

def ensure_wd():
    if "working_directory" not in env.keys():
        with quiet():
            pwd = local("pwd", capture=True) \
                  if env.host in {'localhost', '127.0.0.1'} else run("pwd")
                
        env.working_directory = prompt("Working directory for {host}?"
                                       .format(**env), default=pwd)
    return env.working_directory


def docker(cmd):
    with settings(warn_only=True):
        return run("docker {}".format(cmd if isinstance(cmd, basestring)
                                      else " ".join(cmd)))


@task
def teardown_db_container():
    with settings(hide('warnings', 'running', 'stdout', 'stderr'),
                  warn_only=True):
        docker("rm -f bds_data")
        docker("rm -f bds_postgres")        

@task
def initialize_db_container():
    with settings(warn_only=True):        
        docker(["run",
                "--name bds_data",
                "-v /var/lib/postgresql/data",
                "cogniteev/echo"])
        docker(["run",
                "-p '5432:5432'",
                "-d",
                "--name bds_postgres",
                "--volumes-from bds_data",
                "postgres:9.3"])


@task
def start_or_create_db_container():
    with settings(warn_only=True):
        result = docker("start bds_postgres")
        if result.failed:
            teardown_db_container()
            initialize_db_container()


@task
def pull_files(test=False):
    for name in files.keys():
        try:
            os.makedirs("{}_files".format(name))
        except OSError:
            pass

    with cd(os.path.join(ensure_wd(), "{}_files/".format(name))):
        for tbl_name, url, fn in files[name]:
            if test is True:
                if tbl_name == "ST":
                    run("wget {}".format(os.path.join(url, fn)))
            else:
                run("wget {}".format(os.path.join(url, fn)))


@task
def teardown_databases():
    eng = create_engine('postgresql://postgres@localhost/postgres',
                        isolation_level='AUTOCOMMIT')
    with eng.connect() as conn:
        conn.execute("DROP ROLE IF EXISTS {user}".format(**db_user))
        for k in files.keys():
            conn.execute("DROP DATABASE IF EXISTS {}".format(k))


@task
def setup_databases():
    eng = create_engine('postgresql://postgres@localhost/postgres',
                        isolation_level='AUTOCOMMIT')
    with eng.connect() as conn:
        # Create the user
        sql = 'CREATE ROLE {user} ENCRYPTED PASSWORD \'{password}\''\
              ' NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT LOGIN;'
        try:
            conn.execute(sql.format(**db_user))
        except sqlalchemy.exc.ProgrammingError:
            pass

        # Create the databases
        for k in files.keys():
            try:
                conn.execute('CREATE DATABASE {};'.format(k))
            except sqlalchemy.exc.ProgrammingError:
                print "Database {} already exists. did you mean to teardown first?".format(k)

            # Set user readonly
            conn.execute("GRANT CONNECT ON DATABASE {} TO {user};".format(k, **db_user))

        conn.execute("GRANT USAGE ON SCHEMA public TO {user};".format(k, **db_user))
        conn.execute("GRANT SELECT ON ALL TABLES IN SCHEMA public TO {user};".format(k, **db_user))
        conn.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO {user}".format(k, **db_user))


@task
def build_tables(test=False):
    with cd(ensure_wd()):
        for db_name, tuples in files.items():
            eng = create_engine('postgresql://{user}:{password}@localhost/' \
                                .format(**db_user) + db_name)

            # If this is just a test,  only add the "ST"
            # tables for firm and establishment
            if test is True:
                for table_name, url, fn in tuples:
                    if table_name == "ST":
                        t0 = time.time()
                        df = pd.read_csv("{}_files/{}".format(db_name, fn))
                        df.to_sql(table_name.lower(), eng, chunksize=20000)
                        print "Finished building {}:{} ({})".format(db_name, table_name,
                                                                time.time() - t0)
            else:
                for table_name, url, fn in tuples:
                    t0 = time.time()
                    df = pd.read_csv("{}_files/{}".format(db_name, fn))
                    df.to_sql(table_name.lower(), eng, chunksize=20000)
                    print "Finished building {}:{} ({})".format(db_name, table_name,
                                                                time.time() - t0)
                
        

