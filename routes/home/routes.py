import flask as f

blueprint = f.Blueprint("home", __name__)

@blueprint.route("/news")
def home():
    return f.render_template("home/news.html")

@blueprint.route("/games")
def home_games():
    return f.render_template("home/games.html")

@blueprint.route("/friends")
def home_friends():
    return f.render_template("home/friends.html")