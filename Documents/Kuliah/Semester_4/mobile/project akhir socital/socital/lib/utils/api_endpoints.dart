class ApiEndPoints {
  static final String baseUrl = "http://localhost:8000/api/";
  static _AuthEndPoints authEndpoints = _AuthEndPoints();
}

class _AuthEndPoints {
  final String register = 'register';
  final String login = 'login';
  final String me = 'me';
}
