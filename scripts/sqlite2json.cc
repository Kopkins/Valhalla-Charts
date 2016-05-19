#include <string>
#include <vector>
#include <iostream>
#include <fstream>
#include <sstream>
#include <boost/format.hpp>
#include <sqlite3.h>

using std::string;
using std::vector;

vector<string>& 
getCategories (std::ifstream& in);

void
fillData (std::ifstream& in, vector<vector<float>>& data, vector<string>& countries);

void
generateJson (vector<string>& countries, vector<vector<float>>& data, vector<string>& categories);

static int
callback (void *data, int argc, char **argv, char **azColName);

int
main (int argc, char** argv) {
  // If there is no input file print and error and exit
  if (argc < 2) {
    std::cout << "ERROR: No input file specified." << std::endl;
    std::cout << "Usage: ./sqlite2json statistics.sqlite" << std::endl;
    exit(0);
  }

  // setup for DB connect
  sqlite3 *db;
  char *zErrMsg = 0;
  int rc;
  string sql;
  string data = "Callback Function Called";
  // open DB file
  rc = sqlite3_open(argv[1], &db);
  if ( rc ) {
    std::cout << "Opening DB failed: " << sqlite3_errmsg(db);
    exit(0);
  } else {
    std::cout << "Opened database successfully" << std::endl;
  }

  // fill data structures
  sql = "SELECT * FROM countrydata WHERE isocode IS NOT \"\"";

  rc = sqlite3_exec(db, sql.c_str(), callback, (void*)data.c_str(), &zErrMsg);
  if ( rc != SQLITE_OK ) {
    std::cout << "SQL error: " << zErrMsg << std::endl;
    sqlite3_free(zErrMsg);
  } else {
    std::cout << "Operation Successful" << std::endl;
  }

  sqlite3_close(db);
  return 0;
}

static int
callback (void *data, int argc, char **argv, char **azColName) {
  //std::cout << static_cast<const char*>(data) << std::endl;
  for (int i = 0; i < argc; ++i) {
    std::cout << azColName[i] << " ";
}
  std::cout << std::endl;

  for (int i = 0; i < argc; ++i) {
    std::cout << argv[i] << " ";
  }
  std::cout << std::endl;
  return 0;
}







/*
vector<string>& 
getCategories (std::ifstream& in) {
  // read the first line of the file to determine the categories of the data
  vector<string> *categories = new vector<string> ();
  string line;
  string category;
  if (std::getline(in, line)) {
    std::istringstream iss(line);
    // discard the first header since it is not a label for the data
    iss >> category;
    // put the rest of the tokens of the first line into the vector
    while (iss >> category) {
      categories->push_back(category);
    }
    // If this line is empty we can't continue
  } else {
    std::cout << "ERROR: input is empty" << std::endl;
    exit(1);
  }
  categories->push_back("total");
  return *categories;
}

void
fillData (std::ifstream& in, vector<vector<float>>& data, vector<string>& countries) {
  // read each successive line of the file and parse the data
  string line;
  string iso;
  float val;
  while (std::getline(in, line)) {
    std::istringstream iss(line);
    // store the iso code
    iss >> iso;
    countries.push_back(iso);
    // then iterate through the rest and put into the data vector
    vector<float> *vec = new vector<float>();
    float sum = 0;
    while (iss >> val) {
      sum += val;
      vec->push_back(val);
    }
    vec->push_back(sum);
    data.push_back(*vec);
  }
}

void
generateJson (vector<string>& countries, vector<vector<float>>& data, vector<string>& categories) {

  std::ofstream out ("road_data.js");

  std::stringstream str;
    str << "function getAllRoadData(){\nreturn {\n";
    string fmt = "\"%1%\" : {\n";
    for (size_t i = 0; i < countries.size(); ++i) {
      if (i) fmt = ",\n\"%1%\" : {\n";
      str << boost::format(fmt) % countries[i];
      str << boost::format("  \"name\" : \"%1%\",\n") % countries[i];
      str << "  \"records\": {\n";
      string fmt2 = "    \"%1%\": %2$.2f";
      for (size_t j = 0; j < categories.size(); ++j) {
        if (j) fmt2 = ",\n    \"%1%\": %2$.2f";
        str << boost::format(fmt2) % categories[j] % data[i][j];
      }
      str << "\n  }}";
    }
  str << "\n}}";

  out << str.str() << std::endl;

  out.close();
}
*/
