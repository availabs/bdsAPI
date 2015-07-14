#  The MIT License (MIT)
#
#  Copyright (c) 2015 Christopher Kotfila
#
#  Permission is hereby granted, free of charge, to any person obtaining a copy
#  of this software and associated documentation files (the "Software"), to deal
#  in the Software without restriction, including without limitation the rights
#  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#  copies of the Software, and to permit persons to whom the Software is
#  furnished to do so, subject to the following conditions:
#
#  The above copyright notice and this permission notice shall be included in
#  all copies or substantial portions of the Software.
#
#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
#  THE SOFTWARE.
#


import time
from fabric.api import *
from fabric.context_managers import cd, settings, quiet, lcd
from fabric.contrib.files import exists
import os
from config import files, db_user, replace_codes
import sqlalchemy
from sqlalchemy import create_engine
import pandas as pd
import psycopg2
import sys
from getpass import getpass

sys.dont_write_bytecode = True

##
# pull_files relies on the config.files variable to pull
# down the CSV files from the census bureau web site. Please
# note that these files will be saved to your local machines
# /tmp directory.  They will not be downloaded to the remote
# machine this is so they can be processed with pandas
@task
def pull_files():
    for name in files.keys():
        with settings(warn_only=True):
            local("mkdir /tmp/{}_files".format(name))

        with lcd("/tmp/{}_files/".format(name)):
            for tbl_name, url, fn in files[name]:
                if not os.path.exists("/tmp/{}_files/{}".format(name, fn)):
                    local("wget {}".format(os.path.join(url, fn)))


##
# Teardown the database by removing the bds_user role and
# dropping the firm and establishment databases.


@task
def teardown_databases():
    password = getpass("Please enter postgres user password for {}: "
                       .format(env.host))
    eng = create_engine('postgresql://postgres{}@{}/postgres'
                        .format(":" + password if password else "",
                                env.host),
                        isolation_level='AUTOCOMMIT')


    with eng.connect() as conn:
        with settings(warn_only=True):
            try:
                conn.execute("DROP OWNED BY {user}".format(**db_user))
                conn.execute("DROP ROLE IF EXISTS {user}".format(**db_user))
            except sqlalchemy.exc.ProgrammingError:
                print "Notice: User {user} does not exist!".format(**db_user)

        for k in files.keys():
            conn.execute("DROP DATABASE IF EXISTS {}".format(k))

##
# setup_database creates the bds_user role and the firm
# and establishment databases. It does not do any table related
# importing.


@task
def setup_databases(fail=False):
    password = getpass("Please enter postgres user password for {}: "
                       .format(env.host))
    eng = create_engine('postgresql://postgres{}@{}/postgres'
                        .format(":" + password if password else "",
                                env.host),
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
                    print "Database {} already exists. "
                    "did you mean to teardown first?".format(k)

                    # Set user readonly
                conn.execute("GRANT CONNECT ON DATABASE {} TO {user};"
                             .format(k, **db_user))

            conn.execute("GRANT USAGE ON SCHEMA public TO {user};"
                         .format(k, **db_user))
            conn.execute("GRANT SELECT ON ALL TABLES IN SCHEMA public "
                         "TO {user};".format(k, **db_user))
            conn.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public "
                         "GRANT SELECT ON TABLES TO {user}"
                         .format(k, **db_user))

    except sqlalchemy.exc.OperationalError as e:
        if fail:
            raise
        else:
            print "Warning: Failed to connect to database,  "\
                "trying again in 10 seconds."
            time.sleep(10)
            execute(setup_databases, True)

##
# The Census Bureau does not provide an msa CSV file. this task builds
# an msa table from the AGExMSA table by aggregating each of the fields.
# Please note that these values consider only the MSA values,  non-MSA
# aggregate values can be found in the MET table by selecting the non-msa
# rows (e.g.,  SELECT * FROM met WHERE met = 'N';)
#
# CONSIDER: These aggregation functions were determined empirically on a
#           per-column basis by looking at the magnitude of the difference
#           between SUM and AVG functions. In general they are my best guess
#           for the correct way to aggregate each column,  more robust testing
#           may be needed!


@task
def build_msa_table():
    uri = 'postgresql://{}:{}@{}/bds_firm'.format(db_user['user'],
                                                  db_user['password'],
                                                  env.host)
    eng = create_engine(uri)
    # SQL to create the msa table from the aggregate AGExMSA table
    sql = """
CREATE TABLE msa AS
  SELECT
    year2,
    msa,
    SUM( firms ) as firms,
    SUM( estabs ) as estabs,
    SUM ( emp ) as emp,
    AVG( denom ) as denom,
    SUM( estabs_entry ) as estabs_entry,
    AVG( estabs_entry_rate ) as estabs_entry_rate,
    SUM( estabs_exit ) as estabs_exit,
    SUM( estabs_exit_rate ) as estabs_exit_rate,
    SUM( job_creation ) as job_creation,
    SUM( job_creation_births ) as job_creation_births,
    SUM( job_creation_continuers ) as job_creation_continuers,
    AVG( job_creation_rate_births ) as job_creation_rate_births,
    AVG( job_creation_rate ) as job_creation_rate,
    SUM( job_destruction ) as job_destruction,
    SUM( job_destruction_deaths ) as job_destruction_deaths,
    SUM( job_destruction_continuers ) as job_destruction_continuers,
    AVG( job_destruction_rate_deaths ) as job_destruction_rate_deaths,
    AVG( job_destruction_rate ) as job_destruction_rate,
    SUM( net_job_creation ) as net_job_creation,
    AVG( net_job_creation_rate ) as net_job_creation_rate,
    AVG( reallocation_rate ) as reallocation_rate,
    BIT_OR( d_flag ) as d_flag,
    SUM( firmdeath_firms ) as firmdeath_firms,
    SUM( firmdeath_estabs ) as firmdeath_estabs,
    SUM( firmdeath_emp ) as firmdeath_emp
  FROM
    agexmsa
  GROUP BY
    msa, year2;
    """

    eng.execute(sql)


##
# build_tables reads files that have been pulled down into the /tmp
# directory by the pull_files task. files are read using the
# pandas library into pandas DataFrame objects. Several columns are
# replaced with numeric codes before being converted into SQL statements.
# SQL insert statements are generated in chunks of 100,000 rows.
# Several 'code' tables are generated using the config.replace_codes variable.
#
# CONSIDER: More sophisticated data munging could take place here using pandas
#           DataFrames including geocoding,  deriving new data etc.
@task
def build_tables(test=False):
    for db_name, tuples in files.items():
        uri = 'postgresql://{}:{}@{}/{}'.format(db_user['user'],
                                                db_user['password'],
                                                env.host,
                                                db_name)
        eng = create_engine(uri)

        # Use config.replace_codes to build the "codes" tables
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
            # codes can be found in age4_codes, fage4_codes, etc, the code id's
            # are defined in config.replace_codes
            df.replace(replace_codes[db_name], inplace=True)

            df.to_sql(table_name.lower(), eng, chunksize=100000, index=False)

            print "Finished building {}:{} ({})".format(db_name, table_name,
                                                        time.time() - t0)

##
# Docker specific build commands
#

##
# Not a task,  just a function that takes a string and runs the string
# as a remote command with docker.
#
# @param {str} cmd - arguments to the 'docker' binary (e.g., 'run' or 'ps -a')


def docker(cmd):
    with settings(warn_only=True):
        return run("docker {}".format(cmd if isinstance(cmd, basestring)
                                      else " ".join(cmd)))


##
# initialize_db_container runs two docker containers,  the first
# (bds_data )is a data volume that will be mounted at
# /var/lib/postgresql/data it is based on the cogniteev/echo
# container which contains a highly restricted OS image to minimize
# size.  The second (bds_postgres) is the postgres docker container
# based on version 9.3.  This is a temporary container that will exist
# only as long as it takes to load the data which is stored on the
# bds_data container. This bds_data container will be the  persistant
# data volumne. It will be mounted when ever a disposable postgres:9.3
# container is run.


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


##
# This removes the bds_data and bds_postgres containers.
# Useful if something has gone wrong or you would like to regenerate
# the data volume.
@task
def remove_data(name="bds_data"):
    docker("rm -f {}".format(name))
    docker("rm -f bds_postgres")


##
# This removes the temporary postgres contain used to bootstrap
# the bds_data data volume
@task
def remove_postgres_container():
    docker("stop bds_postgres")
    docker("rm bds_postgres")


##
# PRIMARY ENTRY POINT - build_bds_data_container
#
# This task is the primary entry point for building a docker data
# volume.  If you intend to use the docker-compose tool to run an
# isolated development environment you must generated the bds_data
# container using this task first.
# It is run from the command line as follows:
#
# $[bds_root_directory]/data> fab -H [host] build_bds_data_container
# ...
#
# Fabric is designed to run against remote hosts using SSH. You must
# specify a host to build the docker data volume on. This may be
# localhost. Please note you must be running a local ssh server for
# this to work on localhost! See: https://github.com/fabric/fabric/issues/98


@task
def build_bds_data_container(name="bds_data"):
    execute(remove_data)
    execute(initialize_db_container)
    execute(build_bds)
    execute(remove_postgres_container)



##
# PRIMARY ENTRY POINT
#
# This task the primary entry point for building the bds database on
# a remote postgres database.  As long as it is reachable this task
# does not distinguish between virtualized or actual database servers
# It is run in a similar fashion to build_bds_data_container. Eg.
#
# $[bds_root_directory]/data> fab -H [host] build_bds_data_container
# ...
#
# Unfortunatley it suffers from the same issue described in
# build_bds_data_container.  An ssh server must be running locally if
# the database server is running on localhost.


@task
def build_bds():
    execute(pull_files)
    execute(setup_databases)
    execute(build_tables)
    execute(build_msa_table)
