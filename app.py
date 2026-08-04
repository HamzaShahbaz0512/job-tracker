import anthropic
from flask import Flask,jsonify,request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required
from dotenv import load_dotenv
import os
from flask_cors import CORS

load_dotenv()
api_key = os.getenv("JWT_SECRET_KEY")
anthropic_key = os.getenv("CLAUDE_KEY")



app=Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"]="sqlite:///job.db"
db=SQLAlchemy(app)
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
CORS(app)

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

app.config['JWT_SECRET_KEY']=api_key
JWT=JWTManager(app)
print("DB created successfully")


#Signup the user up
@app.route("/signup",methods=["POST"])
def signup():
    data=request.get_json()
    name1=data.get("name")
    email=data.get("email")
    password=data.get("password")
    hashed_password=generate_password_hash(password)
    
    if(Users.query.filter_by(email=email).first()):
        return jsonify({'error':'User with this email already exists'}),400
    
    new_user=Users(name=name1,email=email,password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": f'User with {email} created'}), 201


@app.route("/login",methods=["POST"])
def login():
    data = request.get_json()
    email=data.get("email")
    password=data.get("password")
    
    user=Users.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password,password):
        return jsonify({"error":"Invalid email or password"}),401
    
    access_token=create_access_token(identity=user.email)
    return jsonify({"access_token": access_token}), 200
    

#create a new job
@app.route("/create_job",methods=["POST"])
@jwt_required()
def create_job():
    
    current_user=get_jwt_identity()
    user=Users.query.filter_by(email=current_user).first()
    job=Job.query.filter_by(job_id=request.json.get("job_id")).first()
    
    data=request.get_json()
    job_id=data.get("job_id")
    company=data.get("company")
    description=data.get("description")
    position=data.get("position")
    status=data.get("status")
    user_id=user.id
    date_applied=data.get("date_applied")

    if job_id is None or company is None or description is None or position is None or status is None or user_id is None or date_applied is None:
        return jsonify({"error": "Missing required fields"}), 400
    
    new_job=Job(
        job_id=job_id,
        company=company,
        description=description,
        position=position,
        status=status,
        user_id=user_id,
        date_applied=date_applied
    )
    db.session.add(new_job)
    db.session.commit()
    return jsonify({"message": f'Job with {job_id} created'}), 201

#return all jobs    
@app.route("/get_jobs",methods=["GET"])
@jwt_required()
def get_jobs():
    jobs=Job.query.all()
    job_list=[]
    if(jobs is None):
        return jsonify({"message":"No jobs found"}),404
    
    for job in jobs:
        job_data={
            "job_id":job.job_id,
            "company":job.company,
            "description":job.description,
            "position":job.position,
            "status":job.status,
            "user_id":job.user_id,
            "date_applied":job.date_applied
        }
        job_list.append(job_data)
    return jsonify(job_list)


#get a specific job
@app.route("/get_job/<job_id>",methods=["GET"])
@jwt_required()
def get_job(job_id):
    job=Job.query.filter_by(job_id=job_id).first()
    if job is None:
        return jsonify({"message":"Job not found"}),404
    return jsonify({
        "job_id":job.job_id,
        "company":job.company,
        "description":job.description,
        "position":job.position,
        "status":job.status,
        "user_id":job.user_id,
        "date_applied":job.date_applied
    })
    
#Jobs assigned to specific user
@app.route("/myJobs/<user_id>",methods=["GET"])
@jwt_required()
def my_jobs(user_id):
    print("Hello")
    jobs=Job.query.filter_by(user_id=user_id).all()
    
    if(jobs is None):
        return jsonify({"message":"No jobs found"}),404

    return jsonify([{
        "job_id":job.job_id,
        "company":job.company,
        "description":job.description,
        "position":job.position,
        "status":job.status,
        "user_id":job.user_id,
        "date_applied":job.date_applied
    } 
        for job in jobs]) 
    
#update job
@app.route("/update_job/<job_id>",methods=["PUT"])
@jwt_required()
def update_job(job_id):
    data=request.get_json()
    
    job=Job.query.get(job_id)
    if not job:
        return jsonify({"message":"Job not found"}),404
    if(data.get("company")):
        job.company=data.get("company")
    if(data.get("description")):
        job.description=data.get("description")
    if(data.get("position")):
        job.position=data.get("position")
    if(data.get("status")):
        job.status=data.get("status")
    if(data.get("application_date")):
        job.date_applied=data.get("date_applied")
    db.session.commit()
    return jsonify({"message":"Job updated successfully"}),200
        
#delete job
@app.route("/delete_job/<job_id>",methods=["DELETE"])
@jwt_required()
def delete_job(job_id):
    job=Job.query.get(job_id)
    if not job:
        return jsonify({"message":"Job not found"}),404
    db.session.delete(job)
    db.session.commit()
    return jsonify({"message":"Job deleted successfully"}),200


#total jobs stats

@app.route("/job_stats",methods=["GET"])
#@jwt_required()
def job_stats():
    total_jobs=Job.query.count()
    applied_jobs=Job.query.filter_by(status="Applied").count()
    interview_jobs=Job.query.filter_by(status="In progress").count()
    offer_job=Job.query.filter_by(status="Offer received").count()
    return jsonify({
        "total_jobs":total_jobs,
        "applied_jobs":applied_jobs,
        "interview_jobs":interview_jobs,
        "offer_job":offer_job
    }),200


#AI End point use to analyze job on the basis of description
@app.route("/analyse_job", methods=["POST"])
@jwt_required()
def analyse_job():
    data = request.get_json()
    description = data.get("description")
    
    client = anthropic.Anthropic(api_key=anthropic_key)
    
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": f"Analyse this job description and tell me: 1) Top 5 skills required 2) How to tailor my application. Job description: {description}"}
        ]
    )

    return jsonify({"analysis": message.content[0].text}), 200
if (__name__ == "__main__"):
    app.run(debug=True)
