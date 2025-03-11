import 'package:flutter/material.dart';
import 'package:socital/styles.dart';
import 'package:socital/widget/custom_texfield.dart';
import 'package:socital/controllers/login_controller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _errorMessage = '';

  void _loginUser() {
    // Implement your login logic here
    String email = _emailController.text;
    String password = _passwordController.text;

    // Validate input fields
    if (email.isEmpty || password.isEmpty) {
      // Show an error message or dialog for empty fields
      setState(() {
        _errorMessage = 'isi semua forms'; // Set error message
      });
      return;
    }

    LoginController().login(
      email: email,
      password: password,
    );

    // If all validations pass, proceed with user login
    // You can send the login data to your backend server here
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(20),
          ),
        ),
        backgroundColor: AppColors.kindaYellow,
        title: Text(
          'Socital',
          style: TextStyles.title,
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(15.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Image.asset('assets/images/LoginRegisterImg.jpg'),
              const SizedBox(
                height: 20.0,
              ),
              Text(
                'Welcome Back!',
                style: TextStyles.body.copyWith(fontSize: 15.0),
              ),
              Text(
                'Login Details',
                style: TextStyles.title,
              ),
              const SizedBox(
                height: 20.0,
              ),
              CustomTextfield(
                controller: _emailController,
                textInputType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                hint: 'Email',
                invisible: false,
              ),
              const SizedBox(
                height: 20.0,
              ),
              CustomTextfield(
                controller: _passwordController,
                textInputType: TextInputType.visiblePassword,
                textInputAction: TextInputAction.done,
                hint: 'Password',
                invisible: true,
              ),
              const SizedBox(
                height: 25.0,
              ),
              ElevatedButton(
                onPressed: _loginUser,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.kindaYellow,
                ),
                child: Text('Login',
                    style: TextStyles.title.copyWith(fontSize: 20.0)),
              ),
              if (_errorMessage.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10.0),
                  child: Text(
                    _errorMessage,
                    style: TextStyle(
                      color: Colors.red,
                    ),
                  ),
                ),
              const SizedBox(
                height: 15.0,
              ),
              Text(
                'Don\'t have an account?',
                style: TextStyles.body.copyWith(fontSize: 15.0),
                textAlign: TextAlign.center,
              ),
              GestureDetector(
                onTap: () {
                  Navigator.pushNamed(context, '/register');
                },
                child: Text(
                  'Sign Up',
                  style: TextStyles.body.copyWith(
                    fontSize: 15.0,
                    color: AppColors.kindaRed,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
