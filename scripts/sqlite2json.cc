#include <string>
#include <vector>
#include <iostream>
#include <fstream>
#include <sstream>
#include <unordered_map>
#include <boost/format.hpp>
#include <sqlite3.h>

using std::string;
using std::vector;

vector<string>& 
getClasses (std::ifstream& in);

void
fillData (std::ifstream& in, vector<vector<float>>& data, vector<string>& countries);

void
generateJson (vector<string>& countries, vector<vector<float>>& data, vector<string>& classes);

void
checkDBResponse(int rc, char* zErrMsg);

void
fillClasses(sqlite3 *db, vector<string>& classes);

void
fillMaxSpeedData(sqlite3 *db);

void
fillCountryData(sqlite3 *db, vector<string>& countries, vector<vector<float>>& data);

static int
classCallback (void *data, int argc, char **argv, char **azColName);

static int
countryDataCallback (void *data, int argc, char **argv, char **azColName);

static int
maxSpeedCallback (void *data, int argc, char **argv, char **azColName);

int
main (int argc, char** argv) {
  // If there is no input file print and error and exit
  if (argc < 2) {
    std::cout << "ERROR: No input file specified." << std::endl;
    std::cout << "Usage: ./sqlite2json statistics.sqlite" << std::endl;
    exit(0);
  }
  // data structures
  vector<string> classes;
  vector<string> countries;
  vector<vector<float>> data;

  // open DB file
  sqlite3 *db;
  int rc = sqlite3_open(argv[1], &db);
  if ( rc ) {
    std::cout << "Opening DB failed: " << sqlite3_errmsg(db);
    exit(0);
  }

  // fill data structures
  fillClasses(db, classes);
  fillCountryData(db, countries, data);
  
  generateJson(countries, data, classes);
  
  sqlite3_close(db);
  return 0;
}

void
checkDBResponse(int rc, char* zErrMsg) {
  if ( rc != SQLITE_OK ) {
    std::cout << "SQL error: " << zErrMsg << std::endl;
    sqlite3_free(zErrMsg);
    exit(0);
  } 
}

void
fillClasses(sqlite3 *db, vector<string>& classes) {
  
  string sql = "SELECT * FROM countrydata LIMIT 1";

  char *zErrMsg = 0;
  int rc = sqlite3_exec(db, sql.c_str(), classCallback, (void*) &classes, &zErrMsg);
  checkDBResponse(rc, zErrMsg);

}

void
fillCountryData(sqlite3 *db, vector<string>& countries, vector<vector<float>>& data) {
  
  string sql = "SELECT * FROM countrydata WHERE isocode IS NOT \"\"";

  char *zErrMsg = 0;
  std::pair<vector<string>*, vector<vector<float>>*> dataPair = {&countries, &data};
  int rc = sqlite3_exec(db, sql.c_str(), countryDataCallback, (void*) &dataPair, &zErrMsg);
  checkDBResponse(rc, zErrMsg);
}

void
fillMaxSpeedData(sqlite3 *db) {
  
  string sql = "SELECT isocode,type,maxspeed";
  sql += " FROM rclassctrydata";
  sql += " WHERE (type='Motorway' OR type='Trunk' OR type='Primary' OR type='Secondary')";
  sql += " AND isocode IS NOT \"\"";

  char *zErrMsg = 0;
  int rc = sqlite3_exec(db, sql.c_str(), maxSpeedCallback, NULL, &zErrMsg);
  checkDBResponse(rc, zErrMsg);
}

static int
classCallback (void *data, int argc, char **argv, char **azColName) {
  vector<string> *cat = (vector<string>*) data;
  for (int i = 1; i < argc; ++i) {
    cat->push_back(azColName[i]);
  }
  cat->push_back("total");
  return 0;
}

static int
countryDataCallback (void *dataPair, int argc, char **argv, char **azColName) {
  std::pair<vector<string>*, vector<vector<float>>*>* p = 
    (std::pair<vector<string>*, vector<vector<float>>*>*) dataPair;
  auto* countries = std::get<0>(*p);
  auto* data = std::get<1>(*p);

  countries->push_back(argv[0]);
  string line = "";
  for (int i = 1; i < argc; ++i) {
    line += argv[i];
    line += " ";
  }

  std::istringstream iss(line);
  float tok;
  float sum = 0;
  vector<float> *classData = new vector<float>();

  while (iss >> tok) {
    classData->push_back(tok);
    sum += tok;
  }
  classData->push_back(sum);
  data->push_back(*classData);

  return 0;
}

static int
maxSpeedCallback (void *data, int argc, char **argv, char **azColName) {

  for (int i = 0; i < argc; ++i) {
    std::cout << argv[i] << " ";
  }
  std::cout << std::endl;
  return 0;
}

void
generateJson (vector<string>& countries, vector<vector<float>>& data, vector<string>& classes) {

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
      for (size_t j = 0; j < classes.size(); ++j) {
        if (j) fmt2 = ",\n    \"%1%\": %2$.2f";
        str << boost::format(fmt2) % classes[j] % data[i][j];
      }
      str << "\n  }}";
    }
  str << "\n}}";

  out << str.str() << std::endl;

  out.close();
}
