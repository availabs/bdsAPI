- [Introduction](#sec-1)
- [Dynamic Routes](#sec-2)
  - [Establishment Data](#sec-2-1)
  - [Firm Data](#sec-2-2)
- [Additional Route Segments](#sec-3)
- [Route Conditions](#sec-4)
- [Codes](#sec-5)
  - [Firm Age](#sec-5-1)
  - [Firm Size & Initial Firm Size](#sec-5-2)
  - [Establishment Age](#sec-5-3)
  - [Establishment Size and Initial Establishment Size](#sec-5-4)
- [Additional Paramaters](#sec-6)
- [Notes for Developers](#sec-7)

# Introduction<a id="sec-1" name="sec-1"></a>

This repository contains code for an JSON API to the Buisness Dynamics Statistics.  It is composed of Python code that downloads, transforms and deploys the CSV files hosted on the Census Bureau's website to a Postgres database and a sails application that connects to that database and dynamically serves content. The Python code relies on the [Fabric](http://www.fabfile.org/) library which streamlines the use of SSH for application deployment and system administration tasks. The fabric script that deploys the database also contains code for deploying to a [Docker](https://www.docker.com/) [data volume](https://docs.docker.com/userguide/dockervolumes/#data-volumes). This data volume can be used in conjunction with the [docker-compose](https://docs.docker.com/compose/) tool to launch local, disposable, development copies of the postgres database and the sails API. 

# Dynamic Routes<a id="sec-2" name="sec-2"></a>

BDS data is aggregate yearly timeseries job birth and job death information derived from the Longitudinal Buisness Database.  It is broken down by firms and establishments,  and then by increasingly specific sub-groups such as state,  age of firm,  top level sic codes and metropolitan statistical areas. Data is provided in ~50 CSV files that begin with the Economy Wide statistics and at their most specific are broken down by Firm Age, Firm Size, Metro/Non-Metro and State.    

Dynamic Routes in the `bdsAPI` allow clients to query this information based on increasingly specific subgroups given that the subgroup combination is made available by the census bureau. Routes return a JSON object.  Unless otherwise specified by the `flat` paramater routes will return an object that groups row data in the order of the dynamic route.  This means clients may request job birth/death broken down by firm age (`/firm/age`) and then based on user actions,  request job birth/death broken down by firm age and size (`/firm/age/sz`). Conversely `/firm/sz/age` will provide breakdowns of job birth/deaths based on firm size,  then firm age.  This is suppoted by the fact that the census bureau provides an AGExSZ CSV file that contains this information. It is not, for instance,  possible to request establishment breakdowns by state and SIC code (`/establishment/st/sic`) - The census bureau does not provide this information.    

Here are the lists of the valid URI segments that may be combined along with their coorisponding database table and descriptions (keep in mind that URI segments may be combined in any order):   

## Establishment Data<a id="sec-2-1" name="sec-2-1"></a>

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="left" />

<col  class="left" />

<col  class="left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="left">Database Tabel</th>
<th scope="col" class="left">URI Segments</th>
<th scope="col" class="left">Description</th>
</tr>
</thead>

<tbody>
<tr>
<td class="left">EW</td>
<td class="left">ew</td>
<td class="left">Economy Wide</td>
</tr>


<tr>
<td class="left">SIC</td>
<td class="left">sic</td>
<td class="left">Sector</td>
</tr>


<tr>
<td class="left">SZ</td>
<td class="left">sz</td>
<td class="left">Establishment Size</td>
</tr>


<tr>
<td class="left">ISZ</td>
<td class="left">isz</td>
<td class="left">Initial Establishment Size</td>
</tr>


<tr>
<td class="left">AGE</td>
<td class="left">age</td>
<td class="left">Establishment Age</td>
</tr>


<tr>
<td class="left">ST</td>
<td class="left">st</td>
<td class="left">State</td>
</tr>


<tr>
<td class="left">AGExSZ</td>
<td class="left">age, sz</td>
<td class="left">Establishment Age by Establishment Size</td>
</tr>


<tr>
<td class="left">AGExISZ</td>
<td class="left">age, isz</td>
<td class="left">Establishment Age by Initial Establishment Size</td>
</tr>


<tr>
<td class="left">AGExSIC</td>
<td class="left">age, sic</td>
<td class="left">Establishment Age by Sector</td>
</tr>


<tr>
<td class="left">SZxSIC</td>
<td class="left">sz, sic</td>
<td class="left">Establishment Size by Sector</td>
</tr>


<tr>
<td class="left">ISZxSIC</td>
<td class="left">isz, sic</td>
<td class="left">Initial Establishment Size by Sector</td>
</tr>


<tr>
<td class="left">AGExST</td>
<td class="left">age, st</td>
<td class="left">Establishment Age by State</td>
</tr>


<tr>
<td class="left">SZxST</td>
<td class="left">sz, st</td>
<td class="left">Establishment Size by State</td>
</tr>


<tr>
<td class="left">ISZxST</td>
<td class="left">isz, st</td>
<td class="left">Initial Establishment Size by State</td>
</tr>


<tr>
<td class="left">AGExSZxSIC</td>
<td class="left">age, sz, sic</td>
<td class="left">Establishment Age by Establishment Size by Sector</td>
</tr>


<tr>
<td class="left">AGExSZxST</td>
<td class="left">age, sz, st</td>
<td class="left">Establishment Age by Establishment Size by State</td>
</tr>


<tr>
<td class="left">AGExISZxSIC</td>
<td class="left">age, isz, sic</td>
<td class="left">Establishment Age by Initial Establishment Size by Sector</td>
</tr>


<tr>
<td class="left">AGExISZxST</td>
<td class="left">age, isz, st</td>
<td class="left">Establishment Age by Initial Establishment Size by State</td>
</tr>
</tbody>
</table>

## Firm Data<a id="sec-2-2" name="sec-2-2"></a>

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="left" />

<col  class="left" />

<col  class="left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="left">Database Table</th>
<th scope="col" class="left">URI Segments</th>
<th scope="col" class="left">Description</th>
</tr>
</thead>

<tbody>
<tr>
<td class="left">EW</td>
<td class="left">ew</td>
<td class="left">Economy Wide</td>
</tr>


<tr>
<td class="left">SIC</td>
<td class="left">sic</td>
<td class="left">Sector</td>
</tr>


<tr>
<td class="left">SZ</td>
<td class="left">sz</td>
<td class="left">Firm Size</td>
</tr>


<tr>
<td class="left">ISZ</td>
<td class="left">isz</td>
<td class="left">Initial Firm Size</td>
</tr>


<tr>
<td class="left">AGE</td>
<td class="left">age</td>
<td class="left">Firm Age</td>
</tr>


<tr>
<td class="left">ST</td>
<td class="left">st</td>
<td class="left">State</td>
</tr>


<tr>
<td class="left">MET</td>
<td class="left">met</td>
<td class="left">Metro/Non-Metro</td>
</tr>


<tr>
<td class="left">AGExSZ</td>
<td class="left">age, sz</td>
<td class="left">Firm Age by Firm Size</td>
</tr>


<tr>
<td class="left">AGExISZ</td>
<td class="left">age, isz</td>
<td class="left">Firm Age by Initial Firm Size</td>
</tr>


<tr>
<td class="left">AGExSIC</td>
<td class="left">age, sic</td>
<td class="left">Firm Age by Sector</td>
</tr>


<tr>
<td class="left">AGExMET</td>
<td class="left">age, met</td>
<td class="left">Firm Age by Metro/Non-Metro</td>
</tr>


<tr>
<td class="left">AGExMSA</td>
<td class="left">age, msa</td>
<td class="left">Firm Age by MSA</td>
</tr>


<tr>
<td class="left">AGExST</td>
<td class="left">age, st</td>
<td class="left">Firm Age by State</td>
</tr>


<tr>
<td class="left">SZxSIC</td>
<td class="left">sz, sic</td>
<td class="left">Firm Size by Sector</td>
</tr>


<tr>
<td class="left">SZxMET</td>
<td class="left">sz, met</td>
<td class="left">Firm Size by Metro/Non-Metro</td>
</tr>


<tr>
<td class="left">SZxMSA</td>
<td class="left">sz, msa</td>
<td class="left">Firm Size by MSA</td>
</tr>


<tr>
<td class="left">SZxST</td>
<td class="left">sz, st</td>
<td class="left">Firm Size by State</td>
</tr>


<tr>
<td class="left">ISZxSIC</td>
<td class="left">isz, sic</td>
<td class="left">Initial Firm Size by Sector</td>
</tr>


<tr>
<td class="left">ISZxMET</td>
<td class="left">isz, met</td>
<td class="left">Initial Firm Size by Metro/Non-Metro</td>
</tr>


<tr>
<td class="left">ISZxST</td>
<td class="left">isz, st</td>
<td class="left">Initial Firm Size by State</td>
</tr>


<tr>
<td class="left">AGExSZxSIC</td>
<td class="left">age, sz, sic</td>
<td class="left">Firm Age by Firm Size by Sector</td>
</tr>


<tr>
<td class="left">AGExSZxST</td>
<td class="left">age, sz, st</td>
<td class="left">Firm Age by Firm Size by State</td>
</tr>


<tr>
<td class="left">AGExSZxMET</td>
<td class="left">age, sz, met</td>
<td class="left">Firm Age by Firm Size by Metro/Non-Metro</td>
</tr>


<tr>
<td class="left">AGExSZxMSA</td>
<td class="left">age, sz, msa</td>
<td class="left">Firm Age by Firm Size by MSA</td>
</tr>


<tr>
<td class="left">AGExISZxSIC</td>
<td class="left">age, isz, sic</td>
<td class="left">Firm Age by Initial Firm Size by Sector</td>
</tr>


<tr>
<td class="left">AGExISZxST</td>
<td class="left">age, isz, st</td>
<td class="left">Firm Age by Initial Firm Size by State</td>
</tr>


<tr>
<td class="left">AGExISZxMET</td>
<td class="left">age, isz, met</td>
<td class="left">Firm Age by Initial Firm Size by Metro/Non-Metro</td>
</tr>


<tr>
<td class="left">AGExSZxMETxST</td>
<td class="left">age, sz, met, st</td>
<td class="left">Firm Age by Firm Size by Metro/Non-Metro by State</td>
</tr>


<tr>
<td class="left">AGExISZxMETxST</td>
<td class="left">age, isz, met, st</td>
<td class="left">Firm Age by Initial Firm Size by Metro/Non-Metro by State</td>
</tr>
</tbody>
</table>

# Additional Route Segments<a id="sec-3" name="sec-3"></a>

BDS data is panel data begining in 1977. By default the leafs of the hierarchical response object will be lists containing objects for each year. This may not be the desired functionality and so it is possible to treat 'yr' as a URI segment that may be added at any level to any of the previous dynamic routes. e.g. `/firm/age/yr/sz`  will return a breakdown of firms by age,  then by year,  then by size.   

The Census bureau does not provide an `msa` table for firms,  though it does provide breakdowns for MSA by age, by size and by age and size.  The fabric deployment script will aggregate the AGExMSA table values to create an MSA table which is available at `/firm/msa.` It is recommended that clients subject this route conditions (See Next Section).

# Route Conditions<a id="sec-4" name="sec-4"></a>

Endpoints may (and in most cases should) be subjected to conditions which reduce the over all size of the data returned (AGExSZxMSA for instance is over 100Mb of text).  This can by done by including zero filled numbers to the end of any URI segment that coorispond to the codes of that URI element (codes may be found in the Code section).  For example the URI:    

`/firm/age01/msa0102301024/sz020310`

will return an object of the form:   

    {"01": 
      {"01023":
        { "02": [ ROW_DATA ],
          "03": [ ROW_DATA ],
          "10": [ ROW_DATA ] },
       "01024":
        "02": [ ROW_DATA ],
        "03": [ ROW_DATA ],
        "10": [ ROW_DATA ]
      }
    }

Where age is subjected to the condition 'age = "01"', msa is subject to the condition  'msa in ("01023", "01024")' and 'size in ("02", "03", "10").' All condition values are fixed width according to their data type where,  years ('yr') are of length 4,  MSA ('msa') are of length 5,  and all others ("age", "sz", "isz", "sic", "st") are of length 2.

# Codes<a id="sec-5" name="sec-5"></a>

States follow FIPS two digit codes. MSA codes follow the numeric codes for metropolitain statistical areas as established by the Office of Management and Budget (OMB), version 2009. All other codes are as follows:  

## Firm Age<a id="sec-5-1" name="sec-5-1"></a>

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="right" />

<col  class="left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="right">code</th>
<th scope="col" class="left">value</th>
</tr>
</thead>

<tbody>
<tr>
<td class="right">00</td>
<td class="left">a) 0</td>
</tr>


<tr>
<td class="right">01</td>
<td class="left">b) 1</td>
</tr>


<tr>
<td class="right">02</td>
<td class="left">c) 2</td>
</tr>


<tr>
<td class="right">03</td>
<td class="left">d) 3</td>
</tr>


<tr>
<td class="right">04</td>
<td class="left">e) 4</td>
</tr>


<tr>
<td class="right">05</td>
<td class="left">f) 5</td>
</tr>


<tr>
<td class="right">06</td>
<td class="left">g) 6 to 10</td>
</tr>


<tr>
<td class="right">07</td>
<td class="left">h) 11 to 15</td>
</tr>


<tr>
<td class="right">08</td>
<td class="left">i) 16 to 20</td>
</tr>


<tr>
<td class="right">09</td>
<td class="left">j) 21 to 25</td>
</tr>


<tr>
<td class="right">10</td>
<td class="left">k) 26+</td>
</tr>


<tr>
<td class="right">11</td>
<td class="left">l) Left Censored</td>
</tr>
</tbody>
</table>

## Firm Size & Initial Firm Size<a id="sec-5-2" name="sec-5-2"></a>

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="right" />

<col  class="left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="right">code</th>
<th scope="col" class="left">value</th>
</tr>
</thead>

<tbody>
<tr>
<td class="right">00</td>
<td class="left">a) 1 to 4</td>
</tr>


<tr>
<td class="right">01</td>
<td class="left">b) 5 to 9</td>
</tr>


<tr>
<td class="right">02</td>
<td class="left">c) 10 to 19</td>
</tr>


<tr>
<td class="right">03</td>
<td class="left">d) 20 to 49</td>
</tr>


<tr>
<td class="right">04</td>
<td class="left">e) 50 to 99</td>
</tr>


<tr>
<td class="right">05</td>
<td class="left">f) 100 to 249</td>
</tr>


<tr>
<td class="right">06</td>
<td class="left">g) 250 to 499</td>
</tr>


<tr>
<td class="right">07</td>
<td class="left">h) 500 to 999</td>
</tr>


<tr>
<td class="right">08</td>
<td class="left">i) 1000 to 2499</td>
</tr>


<tr>
<td class="right">09</td>
<td class="left">j) 2500 to 4999</td>
</tr>


<tr>
<td class="right">10</td>
<td class="left">k) 5000 to 9999</td>
</tr>


<tr>
<td class="right">11</td>
<td class="left">l) 10000+</td>
</tr>
</tbody>
</table>

## Establishment Age<a id="sec-5-3" name="sec-5-3"></a>

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="right" />

<col  class="left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="right">code</th>
<th scope="col" class="left">value</th>
</tr>
</thead>

<tbody>
<tr>
<td class="right">00</td>
<td class="left">a) 0</td>
</tr>


<tr>
<td class="right">01</td>
<td class="left">b) 1</td>
</tr>


<tr>
<td class="right">02</td>
<td class="left">c) 2</td>
</tr>


<tr>
<td class="right">03</td>
<td class="left">d) 3</td>
</tr>


<tr>
<td class="right">04</td>
<td class="left">e) 4</td>
</tr>


<tr>
<td class="right">05</td>
<td class="left">f) 5</td>
</tr>


<tr>
<td class="right">06</td>
<td class="left">g) 6 to 10</td>
</tr>


<tr>
<td class="right">07</td>
<td class="left">h) 11 to 15</td>
</tr>


<tr>
<td class="right">08</td>
<td class="left">i) 16 to 20</td>
</tr>


<tr>
<td class="right">09</td>
<td class="left">j) 21 to 25</td>
</tr>


<tr>
<td class="right">10</td>
<td class="left">k) 26+</td>
</tr>


<tr>
<td class="right">11</td>
<td class="left">l) Left Censored</td>
</tr>
</tbody>
</table>

## Establishment Size and Initial Establishment Size<a id="sec-5-4" name="sec-5-4"></a>

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="right" />

<col  class="left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="right">code</th>
<th scope="col" class="left">value</th>
</tr>
</thead>

<tbody>
<tr>
<td class="right">00</td>
<td class="left">a) 1 to 4</td>
</tr>


<tr>
<td class="right">01</td>
<td class="left">b) 5 to 9</td>
</tr>


<tr>
<td class="right">02</td>
<td class="left">c) 10 to 19</td>
</tr>


<tr>
<td class="right">03</td>
<td class="left">d) 20 to 49</td>
</tr>


<tr>
<td class="right">04</td>
<td class="left">e) 50 to 99</td>
</tr>


<tr>
<td class="right">05</td>
<td class="left">f) 100 to 249</td>
</tr>


<tr>
<td class="right">06</td>
<td class="left">g) 250 to 499</td>
</tr>


<tr>
<td class="right">07</td>
<td class="left">h) 500 to 999</td>
</tr>


<tr>
<td class="right">08</td>
<td class="left">i) 1000+</td>
</tr>
</tbody>
</table>

# Additional Paramaters<a id="sec-6" name="sec-6"></a>

If this hierarchical behavior is not desirable data may be returned as a list of rows by passing the GET argument 'flat' equal to any non falsy value.  For example:

`firm/age01/msa0102301024/sz020310?flat=true`

will return an array of rows. By default each row contains all the columns available in that database.  If a user only wants specific columns they may be selected with the 'fields' GET variable.  For example: 

`firm/age01/msa0102301024/sz020310?fields=job_creation`

Multiple fields may be selected by adding additional fields variables, e.g.

`firm/age01/msa0102301024/sz020310?fields=job_creation&fields=job_death&fields=job_creation_rate`

PLEASE NOTE:  the current parse function does not support paging ( it is not clear the best way to page through a hierarchical object).  This means it is possible to request data that takes a very long time to return and may CRASH the browser if loaded into memory.  It is (currently) the client's responsbility to request reasonable amounts of data!

# Notes for Developers<a id="sec-7" name="sec-7"></a>

The source code contains extensive documentation on each function and developers are encouraged to look through the source code for more information.  Consider begining with the `parse()` function in the `api/controllers/GenericController.js` file.   

Scattered through the comments are `TODO` and `CONSIDER` statements.  TODO statements suggest a code area that should be improved, usually with minimal effort.  These often include better error checking.  CONSIDER statements are more design oriented and suggest ways in which the API or deployment code could be usefully improved or extended.   

By convention functions that lead with an underscore ('<sub>'</sub>)  are intended for within-module use.  You are welcome to use them if you wish but their internal functionality and signatures are not intended to be stable. 

The dynamic routing of field elements circumvents the traditional routing and model design of a sails application. The BDS data does not lend itself to traditional object hierarchies that map well to relational databases.  Because of this models are used only for their generic SQL `query()` method.  Generating this SQL is the router responsiblity of the router, who converts all URI segments after the `/firm` and `/establishment` parts to this custom SQL query.  The guts of this transformation have been abstracted into a Sails [service](http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Services/) `FieldService.js`. This file contains more documentation,  but consider starting by looking at the `route_table()` and the `route_query()` methods. Once SQL rows have been returned the API will group them hierarchically based on the order of the URI segments.  This code is relatively small,  but is managed from a seperate file `GroupService.js`. 

Fabric deployment of the database relies heavily on the [Pandas](http://pandas.pydata.org/) python library for data I/O  and munging. Pandas provides methods for reading from CSV files and writing SQL to databases.  Database connections are managed through [SQLAlchemy](http://www.sqlalchemy.org/) engines. To ensure library support for the munging operations files,  census bureau files will be downloaded into the temporary directory of the **launching** computer,  rather than the remote host that id being deployed too. 
