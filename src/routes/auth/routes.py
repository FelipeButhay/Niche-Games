import flask as f
import src.routes.auth.sql_auth as sql

blueprint = f.Blueprint("auth", __name__)

@blueprint.route("/")
def authRedirect():
    return f.redirect("/login")

@blueprint.route("/login", methods=["GET", "POST"])
def login():
    str_response = ""
    if f.request.method == "POST":
        email = f.request.form["e_mail"]
        password = f.request.form["password"]

        exitCode, user_id = sql.verifyUser(email, password)
        
        match exitCode:
            case sql.authExitCodes.SUCCESS:
                f.session["user_id"] = user_id
                return f.redirect(f.session.get("last_url", "/home/news"))
            case sql.authExitCodes.UNKNOWN:
                str_response = "Unknown error occured."
            case sql.authExitCodes.INVALID_DATA:
                str_response = "Invalid data submited."
            case sql.authExitCodes.INVALID_PASSWORD:
                str_response = "Invalid password."
    
    return f.render_template("auth/login.html.j2", response=str_response)

@blueprint.route("/signin", methods=["GET", "POST"])
def signin():
    str_response = ""
    if f.request.method == "POST":
        username = f.request.form["username"]
        email = f.request.form["e_mail"]
        password = f.request.form["password"]
        
        exitCode, user_id = sql.registerUser(username, email, password)
        
        match exitCode:
            case sql.authExitCodes.SUCCESS:
                f.session["user_id"] = user_id
                return f.redirect(f.session.get("last_url", "/home/news"))
            case sql.authExitCodes.UNKNOWN:
                str_response = "Unknown error occured."
            case sql.authExitCodes.EMAIL_EXISTS:
                str_response = "There is already an account registered with that e-mail."
            case sql.authExitCodes.USERNAME_EXISTS:
                str_response = "There is already an account registered with that username."
            case sql.authExitCodes.ACCOUNT_EXISTS:
                str_response = "This account already exists."
            case sql.authExitCodes.INVALID_DATA:
                str_response = "Some of your creadentials are invalid."
        
    return f.render_template("auth/signin.html.j2", response=str_response)

@blueprint.route("/get-glsl")
def get_glsl():
    with open("assets/shaders/auth_shader.frag", "r", encoding="utf-8") as glsl:
        return f.Response(status=200, response=glsl.read())

@blueprint.route("/logout")
def logout():
    f.session.pop("user_id", None)
    return f.redirect("/auth/signin")