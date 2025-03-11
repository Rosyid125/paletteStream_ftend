import 'package:flutter/material.dart';

class AppColors {
  static const kindaYellow = Color(0xffFFECAA);
  static const kindaBlue = Color(0xff050522);
  static const kindaRed = Color(0xffEF5858);
  static const defWhite = Colors.white;
}

class TextStyles {
  static TextStyle title = const TextStyle(
    fontFamily: 'Outfit',
    fontWeight: FontWeight.bold,
    fontSize: 30.0,
    color: AppColors.kindaRed,
  );
  static TextStyle body = const TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.normal,
    fontSize: 10.0,
    color: AppColors.kindaBlue,
  );
}
