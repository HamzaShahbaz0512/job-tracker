from flask import Flask,jsonify,request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required

app=Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"]="sqlite:///job.db"
db=SQLAlchemy(app)


class Users(db.Model):
    id:Mapped[int]=db.Column(db.Integer,primary_key=True)
    name:Mapped[str]=db.Column(db.String(100),nullable=True)
    email:Mapped[str]=db.Column(db.String(50),nullable=False)
    password:Mapped[str]=db.Column(db.String(100),nullable=False)
    
class Job(db.Model):
    job_id:Mapped[int]=db.Column(db.Integer,primary_key=True)
    company:Mapped[str]=db.Column(db.String(50),nullable=True)
    description:Mapped[str]=db.Column(db.String(50),nullable=False)
    position:Mapped[str]=db.Column(db.String(50),nullable=True)
    status:Mapped[str]=db.Column(db.String(50),nullable=False)
    user_id:Mapped[int]=db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)
    date_applied:Mapped[str]=db.Column(db.String(50),nullable=False)
    
with app.app_context():
    db.create_all()

app.config['JWT_SECRET_KEY']='1A2B3C4D'
JWT=JWTManager(app)
print("DB created successfully")

@app.route("/signup",methods=["POST"])
def signup():
    data=request.get_json()
    name1=data.get("name")
    email=data.get("email")
    password=data.get("password")
    hashed_password=generate_password_hash(password)
    
    if(Users.query.filter_by(name=name1).first()):
        return jsonify({'error':'User with this name already exists'}),400
    
    new_user=Users(name=name1,email=email,password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": f'User with {email} created'}), 201