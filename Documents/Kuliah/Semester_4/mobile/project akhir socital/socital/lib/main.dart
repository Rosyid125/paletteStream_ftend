import 'package:flutter/material.dart';
import 'package:get/get.dart'; // Import Get package
import 'package:socital/routesprotection/ProtectedRoute.dart';

import 'login_screen.dart';
import 'register_screen.dart';
import 'home_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    final AuthService _authService = AuthService();
    return GetMaterialApp(
      // Replace MaterialApp with GetMaterialApp
      debugShowCheckedModeBanner: false,
      // home: FutureBuilder<bool>(
      //   future: _authService.isAuthenticated(),
      //   builder: (context, snapshot) {
      //     if (snapshot.connectionState == ConnectionState.waiting) {
      //       return CircularProgressIndicator(); // Show loading indicator while checking authentication
      //     } else {
      //       if (snapshot.hasData && snapshot.data == true) {
      //         return HomeScreen(); // Navigate to home screen if authenticated
      //       } else {
      //         return LoginScreen(); // Navigate to login screen if not authenticated
      //       }
      //     }
      //   },
      // ),
      initialRoute: '/login', // Set initial route to login
      getPages: [
        GetPage(name: '/login', page: () => LoginScreen()),
        GetPage(
            name: '/register',
            page: () => RegisterScreen()), // Add GetPage for register
        GetPage(
            name: '/home',
            page: () => HomeScreen()), // Add GetPage for register
      ],
    );
  }
}
