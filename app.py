import flask as f
import os

app = f.Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

from routes import home, auth

app.register_blueprint(auth.blueprint, url_prefix="/auth")
app.register_blueprint(home.blueprint, url_prefix="/home")

@app.route("/", methods=["GET", "POST"])
def main():
    if "user_id" not in f.session:
        return f.redirect("/auth/signin")
    else:
        return f.redirect("/home/news")


DEBUG = os.getenv("DEBUG")
if __name__ == "__main__":
    app.run(debug=DEBUG)
