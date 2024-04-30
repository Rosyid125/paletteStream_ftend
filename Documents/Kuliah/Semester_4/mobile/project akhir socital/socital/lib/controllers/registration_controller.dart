import 'dart:convert';

import 'package:socital/utils/api_endpoints.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// final Future<SharedPreferences> _prefs = SharedPreferences.getInstance();

class RegistrationController extends GetxController {
  Future<void> register({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      var headers = {'Content-Type': 'application/json'};
      var url =
          Uri.parse(ApiEndPoints.baseUrl + ApiEndPoints.authEndpoints.register);

      Map<String, String> body = {
        'username': username,
        'email': email.trim(),
        'password': password,
      };

      http.Response response =
          await http.post(url, body: jsonEncode(body), headers: headers);

      if (response.statusCode == 201) {
        print('sukses');
        Get.offNamed('/login');
      } else {
        var message = "Unknown error occurred";
        print(message);
      }
    } catch (e) {
      print('Error: $e');
    }
  }
}
