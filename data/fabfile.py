import time
from fabric.api import *
from fabric.context_managers import cd, settings, quiet
import os
from config import files, db_user, replace_codes
import sqlalchemy
from sqlalchemy import create_engine
import pandas as pd
import psycopg2
import sys

sys.dont_write_bytecode = True

env.hosts = ['localhost']


@task
def pull_files(test=False):
    for name in files.keys():
        try:
            os.makedirs("/tmp/{}_files".format(name))
        except OSError:
            pass

        with cd("/tmp/{}_files/".format(name)):
            for tbl_name, url, fn in files[name]:
                if not os.path.exists("/tmp/{}_files/{}".format(name, fn)):
                    run("wget {}".format(os.path.join(url, fn)))


@task
def teardown_databases():
    eng = create_engine('postgresql://postgres@{}/postgres'.format(env.host),
                        isolation_level='AUTOCOMMIT')

    with eng.connect() as conn:
        with settings(warn_only=True):
            try:
                conn.execute("DROP OWNED BY {user}".format(**db_user))
                conn.execute("DROP ROLE IF EXISTS {user}".format(**db_user))
            except sqlalchemy.exc.ProgrammingError:
                print "Notice: User {user} does not exist!".format(**db_user)
                
#        for k in files.keys():
#            conn.execute("DROP DATABASE IF EXISTS {}".format(k))

 



@task
def setup_databases(fail=False):
    eng = create_engine('postgresql://postgres@{}/postgres'.format(env.host),
                        isolation_level='AUTOCOMMIT')
    try:
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

    except sqlalchemy.exc.OperationalError as e:
        if fail:
            raise
        else:
            print "Warning: Failed to connect to database,  trying again in 10 seconds."
            time.sleep(10)
            execute(setup_databases, True)


@task
def build_tables(test=False):
    for db_name, tuples in files.items():
        uri = 'postgresql://{}:{}@{}/'.format(db_user['user'], db_user['password'], env.host) + db_name
        eng = create_engine(uri)

        for table_key, values in replace_codes[db_name].items():
            df = pd.DataFrame(values.items(), columns=["value", "code"])
            df.to_sql("{}_codes".format(table_key), eng, index=False)

        print "Loading talbes for {}".format(uri)        
        for table_name, url, fn in tuples:
            t0 = time.time()
            print "Reading /tmp/{}_files/{}".format(db_name, fn)
            
            df = pd.read_csv("/tmp/{}_files/{}".format(db_name, fn))
            df.columns = [c.lower() for c in df.columns]

            # Replace age, sz and isz columns with codes instead of strings
            # codes can be found in age4_codes, fage4_codes, etc
            df.replace(replace_codes[db_name], inplace=True)
            
            df.to_sql(table_name.lower(), eng, chunksize=20000, index=False)
            
            print "Finished building {}:{} ({})".format(db_name, table_name,
                                                        time.time() - t0)

##
## Docker specific build commands
##

#@task
def docker(cmd):
    with settings(warn_only=True):
        return run("docker {}".format(cmd if isinstance(cmd, basestring)
                                      else " ".join(cmd)))

@task
def initialize_db_container():
    docker(["run",
            "--name bds_data",
            "-v /var/lib/postgresql/data",
            "cogniteev/echo"])
    docker(["run",
            "-p '5432:5432'",
            "-d",
            "--name bds_postgres",
            "--volumes-from bds_data",
            "postgres:9.3",
            "postgres -d 2"])


@task
def remove_data(name="bds_data"):
    docker("rm -f {}".format(name))
    docker("rm -f bds_postgres")


@task
def remove_postgres_container():
    docker("stop bds_postgres")
    docker("rm bds_postgres")


@task
def build_bds_data_container(name="bds_data"):
    execute(remove_data)
    execute(initialize_db_container)
    execute(pull_files)
    execute(setup_databases)
    execute(build_tables)
    execute(remove_postgres_container)
