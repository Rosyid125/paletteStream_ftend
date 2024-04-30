import 'dart:convert';

import 'package:socital/utils/api_endpoints.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoginController extends GetxController {
  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      var headers = {'Content-Type': 'application/json'};
      var url =
          Uri.parse(ApiEndPoints.baseUrl + ApiEndPoints.authEndpoints.login);

      Map<String, String> body = {
        'email': email.trim(),
        'password': password,
      };

      http.Response response =
          await http.post(url, body: jsonEncode(body), headers: headers);

      if (response.statusCode == 200) {
        var json = jsonDecode(response.body);
        var token = json['token'];
        print(token);
        // SharedPreferences prefs = await SharedPreferences.getInstance();
        // await prefs.setString('token', token);
        Get.offNamed('/home');
      } else {
        var message = "Unknown error occurred";
        print(message);
      }
    } catch (e) {
      print('Error: $e');
    }
  }
}
