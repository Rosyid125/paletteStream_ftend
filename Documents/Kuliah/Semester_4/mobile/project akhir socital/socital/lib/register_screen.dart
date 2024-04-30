import 'package:flutter/material.dart';
import 'package:socital/styles.dart';
import 'package:socital/widget/custom_texfield.dart';
import 'package:socital/controllers/registration_controller.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confPasswordController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();
  String _errorMessage = '';

  void _registerUser() {
    // Implement your registration logic here

    String username = _usernameController.text;
    String email = _emailController.text;
    String password = _passwordController.text;
    String confirmPassword = _confPasswordController.text;

    // Validate input fields
    if (username.isEmpty ||
        email.isEmpty ||
        password.isEmpty ||
        confirmPassword.isEmpty) {
      // Show an error message or dialog for empty fields
      setState(() {
        _errorMessage = "Isi semua forms";
      });
      return;
    }

    if (password != confirmPassword) {
      setState(() {
        _errorMessage = "Password tidak tidak match";
      });
      return;
    }
    // Call register method from controller
    RegistrationController().register(
      username: username,
      email: email,
      password: password,
    );
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
                'Register Details',
                style: TextStyles.title,
              ),
              const SizedBox(
                height: 20.0,
              ),
              CustomTextfield(
                controller: _usernameController,
                textInputType: TextInputType.name,
                textInputAction: TextInputAction.next,
                hint: 'Username',
                invisible: false,
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
                textInputAction: TextInputAction.next,
                hint: 'Password',
                invisible: true,
              ),
              const SizedBox(
                height: 20.0,
              ),
              CustomTextfield(
                controller: _confPasswordController,
                textInputType: TextInputType.visiblePassword,
                textInputAction: TextInputAction.done,
                hint: 'Confirm Password',
                invisible: true,
              ),
              const SizedBox(
                height: 20.0,
              ),
              ElevatedButton(
                onPressed: _registerUser,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.kindaYellow,
                ),
                child: Text('Register',
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
                'Already have an account?',
                style: TextStyles.body.copyWith(fontSize: 15.0),
                textAlign: TextAlign.center,
              ),
              GestureDetector(
                onTap: () {
                  Navigator.pushNamed(context, '/login');
                },
                child: Text(
                  'Sign In',
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
