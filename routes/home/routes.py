import flask as f

blueprint = f.Blueprint("home", __name__)

@blueprint.route("/")
def home():
    return f.render_template("home.html")

@blueprint.route("/games")
def home_games():
    return f.render_template("games.html")

@blueprint.route("/friends")
def home_friends():
    return f.render_template("friends.html")