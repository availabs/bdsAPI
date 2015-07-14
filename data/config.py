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

# Database user information for the BDS firm and establishment databases
#
# @param db_user
#
# CONSIDER: putting this into some kind of seperate ignored configuration
#           file. Otherwise it represents a pretty serious security risk.
#
db_user = {"user": "bds_user",
           "password": "letmein"}

# Files is a dict with two keys which will be used as the database names
# for the BDS firm data and the establishment data.  The values of these
# keys are an array of tuples,  each tuple is (TABLE_NAME, URL, CSV_FILE)
#
# @param {Dict} files
files = {
    "bds_firm": [
        ("EW",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_all_release.csv"),
        ("SIC",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_sic_release.csv"),
        ("SZ",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_sz_release.csv"),
        ("ISZ",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_isz_release.csv"),
        ("AGE",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_age_release.csv"),
        ("ST",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_st_release.csv"),
        ("MET",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_metrononmetro_release.csv"),
        ("AGExSZ",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_agesz_release.csv"),
        ("AGExISZ",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_ageisz_release.csv"),
        ("AGExSIC",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_agesic_release.csv"),
        ("AGExMET",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_agemetrononmetro_release.csv"),
        ("AGExMSA",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_agemsa_release.csv"),
        ("AGExST",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_agest_release.csv"),
        ("SZxSIC",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_szsic_release.csv"),
        ("SZxMET",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_szmetrononmetro_release.csv"),
        ("SZxMSA",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_szmsa_release.csv"),
        ("SZxST",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_szst_release.csv"),
        ("ISZxSIC",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_iszsic_release.csv"),
        ("ISZxMET",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_iszmetrononmetro_release.csv"),
        ("ISZxST",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_iszst_release.csv"),
        ("AGExSZxSIC",
         "http://www2.census.gov/ces/bds/firm/age_size_sector/",
         "bds_f_agesz_sic_release.csv"),
        ("AGExSZxST",
         "http://www2.census.gov/ces/bds/firm/age_size_state/",
         "bds_f_agesz_st_release.csv"),
        ("AGExSZxMET",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_ageszmetrononmetro_release.csv"),
        ("AGExSZxMSA",
         "http://www2.census.gov/ces/bds/firm/age_size_msa/",
         "bds_f_agesz_msa_release.csv"),
        ("AGExISZxSIC",
         "http://www2.census.gov/ces/bds/firm/age_initial_size_sector/",
         "bds_f_ageisz_sic_release.csv"),
        ("AGExISZxST",
         "http://www2.census.gov/ces/bds/firm/age_initial_size_state/",
         "bds_f_ageisz_st_release.csv"),
        ("AGExISZxMET",
         "http://www2.census.gov/ces/bds/firm/",
         "bds_f_ageiszmetro_release.csv"),
        ("AGExSZxMETxST",
         "http://www2.census.gov/ces/bds/firm/age_size_metro_st/",
         "bds_f_ageszmetro_state_release.csv"),
        ("AGExISZxMETxST",
         "http://www2.census.gov/ces/bds/firm/age_initial_size_metro_st/",
         "bds_f_ageiszmetro_state_release.csv")],

    "bds_establishment": [
        ("EW",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_all_release.csv"),
        ("SIC",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_sic_release.csv"),
        ("SZ",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_sz_release.csv"),
        ("ISZ",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_isz_release.csv"),
        ("AGE",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_age_release.csv"),
        ("ST",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_st_release.csv"),
        ("AGExSZ",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_agesz_release.csv"),
        ("AGExISZ",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_ageisz_release.csv"),
        ("AGExSIC",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_agesic_release.csv"),
        ("SZxSIC",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_szsic_release.csv"),
        ("ISZxSIC",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_iszsic_release.csv"),
        ("AGExST",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_agest_release.csv"),
        ("SZxST",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_szst_release.csv"),
        ("ISZxST",
         "http://www2.census.gov/ces/bds/estab/",
         "bds_e_iszst_release.csv"),
        ("AGExSZxSIC",
         "http://www2.census.gov/ces/bds/estab/age_size_sector/",
         "bds_e_agesz_sic_release.csv"),
        ("AGExSZxST",
         "http://www2.census.gov/ces/bds/estab/age_size_state/",
         "bds_e_agesz_st_release.csv"),
        ("AGExISZxSIC",
         "http://www2.census.gov/ces/bds/estab/age_initial_size_sector/",
         "bds_e_ageisz_sic_release.csv"),
        ("AGExISZxST",
         "http://www2.census.gov/ces/bds/estab/age_initial_size_state/",
         "bds_e_ageisz_st_release.csv")]
}

# Pandas dict used to replace the strings contained in
# various CSV files,  these are also used to create the
# codes database tables.
# 
# @param {Dict} replace_codes
replace_codes = {
    "bds_establishment": {
        "size": {
            "a) 1 to 4": 0,
            "b) 5 to 9": 1,
            "c) 10 to 19": 2,
            "d) 20 to 49": 3,
            "e) 50 to 99": 4,
            "f) 100 to 249": 5,
            "g) 250 to 499": 6,
            "h) 500 to 999": 7,
            "i) 1000+": 8,
        },

        "isize": {
            "a) 1 to 4": 0,
            "b) 5 to 9": 1,
            "c) 10 to 19": 2,
            "d) 20 to 49": 3,
            "e) 50 to 99": 4,
            "f) 100 to 249": 5,
            "g) 250 to 499": 6,
            "h) 500 to 999": 7,
            "i) 1000+": 8,
        },

        "age4": {
            "a) 0": 0,
            "b) 1": 1,
            "c) 2": 2,
            "d) 3": 3,
            "e) 4": 4,
            "f) 5": 5,
            "g) 6 to 10": 6,
            "h) 11 to 15": 7,
            "i) 16 to 20": 8,
            "j) 21 to 25": 9,
            "k) 26+": 10,
            "l) Left Censored": 11}
    },
    "bds_firm": {
        "ifsize": {
            "a) 1 to 4": 0,
            "b) 5 to 9": 1,
            "c) 10 to 19": 2,
            "d) 20 to 49": 3,
            "e) 50 to 99": 4,
            "f) 100 to 249": 5,
            "g) 250 to 499": 6,
            "h) 500 to 999": 7,
            "i) 1000 to 2499": 8,
            "j) 2500 to 4999": 9,
            "k) 5000 to 9999": 10,
            "l) 10000+": 11,
        },

        "fsize": {
            "a) 1 to 4": 0,
            "b) 5 to 9": 1,
            "c) 10 to 19": 2,
            "d) 20 to 49": 3,
            "e) 50 to 99": 4,
            "f) 100 to 249": 5,
            "g) 250 to 499": 6,
            "h) 500 to 999": 7,
            "i) 1000 to 2499": 8,
            "j) 2500 to 4999": 9,
            "k) 5000 to 9999": 10,
            "l) 10000+": 11,
        },

        "fage4": {
            "a) 0": 0,
            "b) 1": 1,
            "c) 2": 2,
            "d) 3": 3,
            "e) 4": 4,
            "f) 5": 5,
            "g) 6 to 10": 6,
            "h) 11 to 15": 7,
            "i) 16 to 20": 8,
            "j) 21 to 25": 9,
            "k) 26+": 10,
            "l) Left Censored": 11}
    }
}
