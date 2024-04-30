import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socital/utils/api_endpoints.dart';

class AuthService {
  Future<bool> isAuthenticated() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    var storedToken = prefs.getString('token');
    if (storedToken != null) {
      var headers = {'Authorization': 'Bearer $storedToken'};
      var url = Uri.parse(ApiEndPoints.baseUrl +
          ApiEndPoints.authEndpoints
              .me); // Replace with your endpoint to validate token
      http.Response response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        return true; // User is authenticated
      }
    }
    return false; // User is not authenticated
  }
}
