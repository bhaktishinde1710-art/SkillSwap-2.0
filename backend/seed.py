import datetime
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.learning_interest import LearningInterest
from app.models.availability import Availability
from app.models.session import Session as LearningSession
from app.models.review import Review
from app.models.trust_score import TrustScore
from app.models.notification import Notification
from app.models.report import Report
from app.auth.jwt import get_password_hash
from app.services.trust_score_service import calculate_and_update_trust_score

def seed_database():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        print("Seeding Skills...")
        skills_data = [
            # Programming & DSA
            ("Data Structures & Algorithms (DSA)", "Algorithms", "Binary trees, dynamic programming, graphs, greedy algorithms, and interview question patterns."),
            ("Competitive Programming", "Algorithms", "Codeforces, LeetCode, and CodeChef contest problem-solving techniques."),
            ("Python", "Programming", "Python fundamentals, OOP, data processing, scripting, and standard libraries."),
            ("C++", "Programming", "Modern C++ (C++17/20), STL containers, memory management, and pointers."),
            ("Java", "Programming", "Core Java, OOP principles, multi-threading, collections framework, and JVM internals."),
            ("C", "Programming", "Low-level system programming, pointers, structs, and memory allocation in C."),
            ("Rust", "Programming", "Memory safety without garbage collection, borrow checker, ownership, and concurrency."),
            ("Go (Golang)", "Programming", "Goroutines, channels, microservices, and high-performance server programming."),

            # AI & Data Science
            ("Machine Learning", "Artificial Intelligence", "Supervised/unsupervised learning, scikit-learn, regression, decision trees, and model evaluation."),
            ("Deep Learning", "Artificial Intelligence", "Neural networks, CNNs, RNNs, Transformers, and optimization algorithms."),
            ("Data Science", "Data Science", "Pandas, NumPy, data cleaning, exploratory data analysis, and statistical testing."),
            ("PyTorch", "Artificial Intelligence", "Building, training, and deploying neural network architectures with PyTorch."),
            ("TensorFlow / Keras", "Artificial Intelligence", "End-to-end model building, model export, and deep learning pipelines."),
            ("Computer Vision", "Artificial Intelligence", "OpenCV, image preprocessing, object detection (YOLO), and image classification."),
            ("Natural Language Processing (NLP)", "Artificial Intelligence", "Tokenization, embeddings, HuggingFace Transformers, and LLM fine-tuning."),

            # Web & Mobile Development
            ("Web Development", "Web Development", "HTML5, CSS3, modern JavaScript, semantic web, and responsive layouts."),
            ("React", "Web Development", "Component architecture, hooks, state management (Redux/Zustand), and React Router."),
            ("Next.js", "Web Development", "Server-side rendering, App Router, static generation, and full-stack React."),
            ("Node.js", "Web Development", "Express.js, asynchronous I/O, REST API design, and middleware architecture."),
            ("FastAPI", "Web Development", "High-performance Python asynchronous APIs, Pydantic validation, and Swagger OpenAPI."),
            ("Tailwind CSS", "Web Development", "Utility-first modern styling, responsive layouts, and clean UI components."),
            ("Android Development (Kotlin)", "Mobile Development", "Native Android apps with Kotlin, Jetpack Compose, activities, and fragments."),
            ("Flutter", "Mobile Development", "Cross-platform mobile application development with Dart."),

            # DevOps, Cloud & Systems
            ("Docker & Kubernetes", "DevOps & Cloud", "Containerization, Dockerfiles, docker-compose, and container orchestration basics."),
            ("Cloud Computing (AWS)", "DevOps & Cloud", "AWS EC2, S3, Lambda, IAM, VPC, and cloud architecture principles."),
            ("Git & GitHub", "DevOps & Cloud", "Branching workflows, pull requests, merge conflict resolution, and open source collaboration."),
            ("Linux Administration", "DevOps & Cloud", "Bash scripting, systemctl, file permissions, networking, and server configuration."),

            # Security, Hardware & Core
            ("Cybersecurity", "Cybersecurity", "Network security, ethical hacking, OWASP Top 10 vulnerabilities, and cryptography."),
            ("Embedded Systems & IoT", "Core Engineering", "Arduino, ESP32, Raspberry Pi, sensor integration, and microcontrollers."),
            ("VLSI Design", "Core Engineering", "Verilog HDL, digital logic design, FPGA programming, and ASIC design fundamentals."),
            ("Robotics & ROS", "Core Engineering", "Robot Operating System (ROS), kinematics, actuators, and sensor fusion."),

            # Design & Career Prep
            ("SQL & Database Design", "Database", "Relational database schema modeling, indexing, joins, and query optimization."),
            ("UI/UX Design (Figma)", "Design", "Wireframing, prototyping, design systems, visual hierarchy, and user research."),
            ("Excel & Data Analysis", "Academics", "Advanced formulas (VLOOKUP, INDEX-MATCH), pivot tables, dashboards, and charts."),
            ("Technical Interview Prep", "Career Prep", "Mock technical interviews, system design fundamentals, and behavioral questions."),
            ("Communication Skills", "Career Prep", "Campus presentations, group discussion (GD) tactics, and professional soft skills.")
        ]

        skill_records = {}
        for name, category, desc in skills_data:
            s = Skill(name=name, category=category, description=desc)
            db.add(s)
            db.flush()
            skill_records[name] = s

        print(f"Created {len(skill_records)} skills.")

        print("Seeding Users (VIT Pune Campus)...")
        default_pwd_hash = get_password_hash("Password123!")
        admin_pwd_hash = get_password_hash("AdminPass123!")

        # 1. Admin Account
        admin = User(
            college_email="admin@vit.edu",
            password_hash=admin_pwd_hash,
            first_name="VIT",
            last_name="Administrator",
            college="Vishwakarma Institute of Technology (VIT), Pune",
            department="Computer Science Engineering (CSE)",
            year="Fourth Year",
            role="admin",
            verification_status="verified",
            bio="Official Campus Administrator & Peer Learning Coordinator at VIT Pune.",
            onboarding_completed=True
        )
        db.add(admin)
        db.flush()

        # 2. 25 Realistic Fictional Indian Student Profiles at VIT Pune
        students_info = [
            ("Aarav", "Sharma", "aarav.sharma@vit.edu", "Computer Science Engineering (CSE)", "Fourth Year",
             "Competitive programmer (Candidate Master on CF). Passionate about teaching DSA, dynamic programming, and helping juniors crack product-based campus placements.",
             [("Data Structures & Algorithms (DSA)", "Expert", 3.0), ("C++", "Expert", 3.5), ("Competitive Programming", "Advanced", 2.5)],
             [("Deep Learning", "Intermediate", "High"), ("Docker & Kubernetes", "Intermediate", "Medium")]),

            ("Ananya", "Deshmukh", "ananya.deshmukh@vit.edu", "CSE (Artificial Intelligence)", "Third Year",
             "AI researcher at VIT Pune AI Lab. Working on vision transformers and NLP. Love explaining machine learning from intuitive fundamentals.",
             [("Machine Learning", "Expert", 2.5), ("Deep Learning", "Advanced", 2.0), ("Python", "Advanced", 3.0), ("PyTorch", "Advanced", 2.0)],
             [("Docker & Kubernetes", "Beginner", "High"), ("FastAPI", "Intermediate", "Medium")]),

            ("Rohan", "Kulkarni", "rohan.kulkarni@vit.edu", "Information Technology (IT)", "Fourth Year",
             "Full-stack developer who built apps with 50k+ users. Proficient in React, Node.js, and modern cloud deployment.",
             [("Web Development", "Expert", 3.0), ("React", "Expert", 3.0), ("Node.js", "Advanced", 2.5), ("Tailwind CSS", "Expert", 2.0)],
             [("Cloud Computing (AWS)", "Intermediate", "High"), ("Cybersecurity", "Beginner", "Medium")]),

            ("Snehal", "Patil", "snehal.patil@vit.edu", "Artificial Intelligence & Data Science (AI&DS)", "Third Year",
             "Data analytics enthusiast. Conducted data science bootcamps on campus. Love working with Pandas, SQL, and PowerBI.",
             [("Data Science", "Advanced", 2.0), ("SQL & Database Design", "Advanced", 2.5), ("Python", "Advanced", 2.0), ("Excel & Data Analysis", "Expert", 3.0)],
             [("Machine Learning", "Advanced", "High"), ("Technical Interview Prep", "Intermediate", "High")]),

            ("Aditya", "Joshi", "aditya.joshi@vit.edu", "Electronics & Telecommunication (E&TC)", "Fourth Year",
             "Embedded systems developer and robotics team lead. Built smart IoT prototypes and autonomous rovers at VIT.",
             [("Embedded Systems & IoT", "Expert", 3.5), ("C", "Advanced", 3.0), ("Robotics & ROS", "Advanced", 2.0)],
             [("Python", "Intermediate", "High"), ("Linux Administration", "Intermediate", "Medium")]),

            ("Tanvi", "Shinde", "tanvi.shinde@vit.edu", "Computer Science Engineering (CSE)", "Second Year",
             "Curious sophomore learning full-stack development and strengthening DSA fundamentals. Open to peer mentoring beginners in Python.",
             [("Python", "Intermediate", 1.5), ("Web Development", "Intermediate", 1.0)],
             [("Data Structures & Algorithms (DSA)", "Advanced", "High"), ("React", "Intermediate", "High")]),

            ("Vikram", "Mehta", "vikram.mehta@vit.edu", "Mechanical Engineering", "Third Year",
             "Mechanical engineer bridging hardware and software through Python automation, 3D modeling, and CAD analysis.",
             [("Robotics & ROS", "Intermediate", 1.5), ("Python", "Intermediate", 2.0), ("Excel & Data Analysis", "Advanced", 2.5)],
             [("Machine Learning", "Beginner", "High"), ("Data Science", "Beginner", "Medium")]),

            ("Ishita", "Gupta", "ishita.gupta@vit.edu", "Information Technology (IT)", "Fourth Year",
             "DevOps and Cloud intern. AWS Certified Solutions Architect Associate. Passionate about Docker, CI/CD, and Linux.",
             [("Cloud Computing (AWS)", "Expert", 2.5), ("Docker & Kubernetes", "Advanced", 2.0), ("Linux Administration", "Expert", 3.0), ("Git & GitHub", "Expert", 3.5)],
             [("Go (Golang)", "Intermediate", "Medium"), ("Rust", "Beginner", "Low")]),

            ("Niharika", "Rao", "niharika.rao@vit.edu", "Computer Science Engineering (CSE)", "Third Year",
             "Product designer and frontend enthusiast. Designed multiple college fest portals in Figma and built clean React UIs.",
             [("UI/UX Design (Figma)", "Expert", 2.5), ("React", "Advanced", 2.0), ("Tailwind CSS", "Expert", 2.0)],
             [("Data Structures & Algorithms (DSA)", "Intermediate", "High"), ("FastAPI", "Beginner", "Medium")]),

            ("Siddharth", "Verma", "siddharth.verma@vit.edu", "CSE (Artificial Intelligence)", "Fourth Year",
             "Cybersecurity enthusiast and CTF player. Happy to teach network security, penetration testing basics, and safe coding.",
             [("Cybersecurity", "Advanced", 2.5), ("Linux Administration", "Advanced", 2.5), ("Python", "Advanced", 2.0)],
             [("Natural Language Processing (NLP)", "Intermediate", "Medium"), ("Cloud Computing (AWS)", "Beginner", "High")]),

            ("Pooja", "Chavan", "pooja.chavan@vit.edu", "Electronics & Telecommunication (E&TC)", "Third Year",
             "Interested in digital logic and FPGA implementation. Mentoring students in C and digital electronics.",
             [("VLSI Design", "Advanced", 2.0), ("C", "Advanced", 2.0), ("Embedded Systems & IoT", "Intermediate", 1.5)],
             [("Data Structures & Algorithms (DSA)", "Intermediate", "High"), ("Python", "Intermediate", "Medium")]),

            ("Kunal", "Bansal", "kunal.bansal@vit.edu", "Computer Science Engineering (CSE)", "Fourth Year",
             "FastAPI and backend systems developer. Built distributed microservices and database engines.",
             [("FastAPI", "Expert", 2.5), ("Python", "Expert", 3.0), ("SQL & Database Design", "Advanced", 2.5), ("Git & GitHub", "Advanced", 2.0)],
             [("Docker & Kubernetes", "Advanced", "High"), ("Cloud Computing (AWS)", "Intermediate", "High")]),

            ("Riya", "Sen", "riya.sen@vit.edu", "Artificial Intelligence & Data Science (AI&DS)", "Second Year",
             "Second year student diving deep into Computer Vision and PyTorch. Active student volunteer in GDG VIT Pune.",
             [("Python", "Intermediate", 1.5), ("Data Science", "Intermediate", 1.0)],
             [("Computer Vision", "Advanced", "High"), ("PyTorch", "Intermediate", "High")]),

            ("Devendra", "Pawar", "devendra.pawar@vit.edu", "Mechanical Engineering", "Fourth Year",
             "Graduating senior. Former head of SAE Baja team at VIT. Mentoring in technical communication and interview skills.",
             [("Communication Skills", "Expert", 3.0), ("Technical Interview Prep", "Advanced", 2.0)],
             [("Python", "Beginner", "High"), ("Excel & Data Analysis", "Intermediate", "Medium")]),

            ("Meera", "Nair", "meera.nair@vit.edu", "Information Technology (IT)", "Third Year",
             "Mobile app developer who published 3 apps on Google Play using Flutter and Kotlin.",
             [("Android Development (Kotlin)", "Advanced", 2.0), ("Flutter", "Expert", 2.5), ("Java", "Advanced", 2.0)],
             [("UI/UX Design (Figma)", "Intermediate", "High"), ("FastAPI", "Intermediate", "Medium")]),

            ("Varun", "Kadam", "varun.kadam@vit.edu", "Computer Science Engineering (CSE)", "Third Year",
             "Java enterprise backend developer. Familiar with Spring Boot, OOP design patterns, and multithreading.",
             [("Java", "Advanced", 2.5), ("SQL & Database Design", "Advanced", 2.0), ("Git & GitHub", "Intermediate", 1.5)],
             [("Docker & Kubernetes", "Intermediate", "High"), ("Next.js", "Beginner", "Medium")]),

            ("Sakshi", "Gaikwad", "sakshi.gaikwad@vit.edu", "CSE (Artificial Intelligence)", "Fourth Year",
             "NLP specialist working on low-resource Indian languages. Happy to guide on HuggingFace and PyTorch.",
             [("Natural Language Processing (NLP)", "Advanced", 2.0), ("PyTorch", "Advanced", 2.0), ("Python", "Advanced", 2.5)],
             [("Cloud Computing (AWS)", "Beginner", "High"), ("FastAPI", "Intermediate", "Medium")]),

            ("Harsh", "Agrawal", "harsh.agrawal@vit.edu", "Instrumentation & Control Engineering", "Third Year",
             "Instrumentation student specializing in industrial automation, sensor telemetry, and IoT protocols.",
             [("Embedded Systems & IoT", "Advanced", 2.0), ("C", "Intermediate", 1.5)],
             [("Python", "Intermediate", "High"), ("Machine Learning", "Beginner", "High")]),

            ("Divya", "Suryavanshi", "divya.suryavanshi@vit.edu", "Computer Science Engineering (CSE)", "Second Year",
             "Front-end enthusiast building clean, accessible web interfaces. Looking for a mentor in DSA.",
             [("Web Development", "Intermediate", 1.5), ("Tailwind CSS", "Intermediate", 1.0)],
             [("Data Structures & Algorithms (DSA)", "Advanced", "High"), ("C++", "Intermediate", "High")]),

            ("Pranav", "Bhide", "pranav.bhide@vit.edu", "Information Technology (IT)", "Third Year",
             "Go developer exploring distributed systems and high-throughput microservices.",
             [("Go (Golang)", "Advanced", 2.0), ("Linux Administration", "Intermediate", 1.5), ("Git & GitHub", "Advanced", 2.0)],
             [("Docker & Kubernetes", "Advanced", "High"), ("Cloud Computing (AWS)", "Intermediate", "High")]),

            ("Shreya", "Jadhav", "shreya.jadhav@vit.edu", "Artificial Intelligence & Data Science (AI&DS)", "Fourth Year",
             "Data Science intern with experience in time-series forecasting and SQL performance optimization.",
             [("Data Science", "Advanced", 2.5), ("SQL & Database Design", "Expert", 2.5), ("Python", "Advanced", 2.5)],
             [("Deep Learning", "Advanced", "High"), ("FastAPI", "Intermediate", "Medium")]),

            ("Arjun", "Trivedi", "arjun.trivedi@vit.edu", "Computer Science Engineering (CSE)", "Fourth Year",
             "Placement coordinator and mentor. Cracked offers at top tier tech firms; coaching students for coding interviews.",
             [("Technical Interview Prep", "Expert", 3.0), ("Data Structures & Algorithms (DSA)", "Expert", 3.0), ("Communication Skills", "Advanced", 2.5)],
             [("Next.js", "Intermediate", "Medium"), ("Rust", "Beginner", "Low")]),

            ("Aishwarya", "More", "aishwarya.more@vit.edu", "Electronics & Telecommunication (E&TC)", "Second Year",
             "Passionate second-year student exploring robotics and basic C++ programming.",
             [("C++", "Intermediate", 1.0)],
             [("Embedded Systems & IoT", "Intermediate", "High"), ("Robotics & ROS", "Beginner", "High")]),

            ("Yash", "Gokhale", "yash.gokhale@vit.edu", "Information Technology (IT)", "Third Year",
             "Next.js and modern React developer. Interested in building performant student community tools.",
             [("Next.js", "Advanced", 2.0), ("React", "Advanced", 2.5), ("Web Development", "Advanced", 2.5)],
             [("FastAPI", "Intermediate", "High"), ("Docker & Kubernetes", "Beginner", "Medium")]),

            ("Neeraj", "Choudhary", "neeraj.choudhary@vit.edu", "Computer Science Engineering (CSE)", "Fourth Year",
             "Rust enthusiast and systems programmer. Mentoring juniors who want to write low-latency, memory-safe software.",
             [("Rust", "Advanced", 2.0), ("C++", "Advanced", 2.5), ("Linux Administration", "Advanced", 2.0)],
             [("Distributed Systems", "Advanced", "High"), ("Cloud Computing (AWS)", "Intermediate", "Medium")])
        ]

        created_users = []
        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for idx, (first, last, email, dept, year, bio, t_skills, l_interests) in enumerate(students_info):
            user = User(
                college_email=email,
                password_hash=default_pwd_hash,
                first_name=first,
                last_name=last,
                college="Vishwakarma Institute of Technology (VIT), Pune",
                department=dept,
                year=year,
                bio=bio,
                role="student",
                verification_status="verified",
                learning_preferences="Online & Library Study Pods, VIT Pune Campus",
                onboarding_completed=True
            )
            db.add(user)
            db.flush()
            created_users.append(user)

            # Teaching skills
            for s_name, prof, exp in t_skills:
                sk = skill_records.get(s_name)
                if sk:
                    usk = UserSkill(
                        user_id=user.id,
                        skill_id=sk.id,
                        proficiency_level=prof,
                        years_of_experience=exp,
                        verification_status="verified"
                    )
                    db.add(usk)

            # Learning interests
            for s_name, d_level, prio in l_interests:
                sk = skill_records.get(s_name)
                if sk:
                    li = LearningInterest(
                        user_id=user.id,
                        skill_id=sk.id,
                        desired_level=d_level,
                        priority=prio
                    )
                    db.add(li)

            # Availability: 2 to 3 slots per student
            day1 = days_of_week[(idx * 2) % 7]
            day2 = days_of_week[(idx * 2 + 2) % 7]
            db.add(Availability(user_id=user.id, day=day1, start_time="16:00", end_time="18:00", available=True))
            db.add(Availability(user_id=user.id, day=day2, start_time="18:30", end_time="20:30", available=True))
            if idx % 2 == 0:
                db.add(Availability(user_id=user.id, day="Saturday", start_time="10:00", end_time="12:00", available=True))

            # Initialize initial Trust Score
            ts = TrustScore(
                user_id=user.id,
                score=85.0 + (idx % 12),
                reliability_score=85.0 + (idx % 10),
                teaching_score=88.0 + (idx % 8),
                review_score=80.0 + (idx % 10),
                completion_score=90.0,
                calculated_at=datetime.datetime.utcnow()
            )
            db.add(ts)

        db.commit()
        print(f"Created {len(created_users)} student accounts with skills, interests, and schedules.")

        print("Seeding Sessions and Peer Reviews...")
        today = datetime.date.today()

        # Seed Completed Sessions with authentic feedback
        completed_sessions_data = [
            (created_users[5], created_users[0], "Data Structures & Algorithms (DSA)", today - datetime.timedelta(days=12), "16:00", "17:00",
             5, "Aarav bhaiya solved all my doubts on recursion and backtracking with clear dry runs! Super helpful for my upcoming semester exam."),

            (created_users[18], created_users[0], "C++", today - datetime.timedelta(days=8), "18:30", "19:30",
             5, "Fantastic C++ pointers and memory management session. He simplified dynamic memory allocation in a way textbooks never did."),

            (created_users[1], created_users[2], "React", today - datetime.timedelta(days=10), "16:00", "17:30",
             5, "Rohan is an amazing mentor. Taught me how useEffect and custom hooks actually work with a live mini-project."),

            (created_users[8], created_users[2], "Web Development", today - datetime.timedelta(days=6), "18:30", "19:30",
             4, "Very practical session on CSS Grid and responsive cards. Explained everything step-by-step."),

            (created_users[0], created_users[1], "Machine Learning", today - datetime.timedelta(days=14), "17:00", "18:00",
             5, "Ananya explained gradient descent and loss functions intuitively using 3D plots. Highly recommended AI mentor at VIT!"),

            (created_users[12], created_users[1], "Deep Learning", today - datetime.timedelta(days=5), "16:00", "17:30",
             5, "Super clear explanation of Convolutional layers, pooling, and PyTorch tensors. Can't wait for our next session!"),

            (created_users[6], created_users[3], "Data Science", today - datetime.timedelta(days=7), "16:00", "17:00",
             5, "Snehal helped me clean an unstructured dataset in Pandas and generate correlation heatmaps. Awesome teaching quality."),

            (created_users[19], created_users[7], "Cloud Computing (AWS)", today - datetime.timedelta(days=9), "18:00", "19:30",
             5, "Ishita set up an EC2 instance with me live and showed how security groups and SSH keys work. Practical and clear!"),

            (created_users[7], created_users[8], "UI/UX Design (Figma)", today - datetime.timedelta(days=11), "16:00", "17:00",
             5, "Niharika gave me direct feedback on my campus app wireframes. Learned autolayout and Figma component variants."),

            (created_users[4], created_users[9], "Cybersecurity", today - datetime.timedelta(days=4), "17:00", "18:00",
             4, "Good hands-on session on Wireshark packet analysis and Linux terminal tools."),

            (created_users[10], created_users[4], "Embedded Systems & IoT", today - datetime.timedelta(days=15), "16:00", "17:30",
             5, "Aditya brought actual ESP32 modules to the VIT discussion room. Explained I2C and SPI protocols thoroughly."),

            (created_users[5], created_users[11], "FastAPI", today - datetime.timedelta(days=3), "18:30", "19:30",
             5, "Kunal helped me debug async route handlers and Pydantic validation schemas. Solved my issue within 20 minutes!"),

            (created_users[15], created_users[21], "Technical Interview Prep", today - datetime.timedelta(days=6), "17:00", "18:00",
             5, "Arjun gave me a mock interview on system design and resume review. His placement insights are invaluable for final year students."),

            (created_users[2], created_users[14], "Flutter", today - datetime.timedelta(days=4), "16:00", "17:00",
             5, "Meera taught me state management with Provider in Flutter. Very patient and structured mentor."),

            (created_users[22], created_users[24], "Rust", today - datetime.timedelta(days=2), "18:00", "19:00",
             5, "Neeraj explained the borrow checker and lifetimes with clear metaphors. Made Rust feel approachable!")
        ]

        for learner, mentor, skill_name, s_date, start_t, end_t, rating, comment in completed_sessions_data:
            sk = skill_records.get(skill_name)
            if not sk:
                continue

            sess = LearningSession(
                learner_id=learner.id,
                mentor_id=mentor.id,
                skill_id=sk.id,
                scheduled_date=s_date,
                start_time=start_t,
                end_time=end_t,
                mode="Online",
                meeting_link=f"https://meet.google.com/ssw-vit-{mentor.id}{learner.id}",
                location="Google Meet",
                notes="Peer session covering key concepts and real code implementations.",
                status="Completed",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15)
            )
            db.add(sess)
            db.flush()

            # Review
            rev = Review(
                session_id=sess.id,
                reviewer_id=learner.id,
                reviewed_user_id=mentor.id,
                rating=rating,
                comment=comment,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            )
            db.add(rev)

        # Seed Upcoming & Scheduled Sessions
        future_sessions = [
            (created_users[5], created_users[0], "Data Structures & Algorithms (DSA)", today + datetime.timedelta(days=2), "16:00", "17:00", "Scheduled", "Dynamic Programming Part 2: Knapsack & Subsequences"),
            (created_users[3], created_users[1], "Machine Learning", today + datetime.timedelta(days=3), "17:00", "18:00", "Scheduled", "Model deployment on HuggingFace Spaces"),
            (created_users[13], created_users[2], "React", today + datetime.timedelta(days=4), "18:30", "19:30", "Scheduled", "Connecting React Frontend to FastAPI backend"),
            (created_users[18], created_users[7], "Cloud Computing (AWS)", today + datetime.timedelta(days=5), "16:00", "17:00", "Scheduled", "Setting up S3 buckets and IAM policies")
        ]

        for learner, mentor, skill_name, s_date, start_t, end_t, status, notes in future_sessions:
            sk = skill_records.get(skill_name)
            if sk:
                sess = LearningSession(
                    learner_id=learner.id,
                    mentor_id=mentor.id,
                    skill_id=sk.id,
                    scheduled_date=s_date,
                    start_time=start_t,
                    end_time=end_t,
                    mode="Online",
                    meeting_link=f"https://meet.google.com/ssw-vit-{mentor.id}{learner.id}",
                    location="Google Meet",
                    notes=notes,
                    status=status
                )
                db.add(sess)

        # Seed Pending Session Requests
        pending_requests = [
            (created_users[23], created_users[0], "Data Structures & Algorithms (DSA)", today + datetime.timedelta(days=3), "18:30", "19:30", "Need guidance on Trie data structures and LeetCode hard problems."),
            (created_users[6], created_users[1], "PyTorch", today + datetime.timedelta(days=4), "16:00", "17:00", "Troubleshooting PyTorch DataLoader for custom image dataset."),
            (created_users[11], created_users[7], "Docker & Kubernetes", today + datetime.timedelta(days=5), "18:00", "19:00", "Multi-stage Dockerfile optimization for production build.")
        ]

        for learner, mentor, skill_name, s_date, start_t, end_t, notes in pending_requests:
            sk = skill_records.get(skill_name)
            if sk:
                sess = LearningSession(
                    learner_id=learner.id,
                    mentor_id=mentor.id,
                    skill_id=sk.id,
                    scheduled_date=s_date,
                    start_time=start_t,
                    end_time=end_t,
                    mode="Online",
                    meeting_link=None,
                    location="Google Meet",
                    notes=notes,
                    status="Pending"
                )
                db.add(sess)

        # Seed Notifications
        for u in created_users[:5]:
            db.add(Notification(
                user_id=u.id,
                title="Welcome to SkillSwap VIT Pune!",
                message="Welcome to your campus peer-learning hub! Connect with peers and share your engineering skills.",
                type="system",
                read=True
            ))
            db.add(Notification(
                user_id=u.id,
                title="Upcoming Peer Session",
                message="You have an active peer session coming up this week. Check your session dashboard.",
                type="session_accepted",
                read=False,
                link="/sessions"
            ))

        # Seed Sample Admin Reports
        db.add(Report(
            reporter_id=created_users[3].id,
            reported_user_id=created_users[14].id,
            reason="Scheduling Conflict Reschedule Request",
            description="Learner requested to adjust scheduled time from library room to Google Meet due to lab hours.",
            status="pending"
        ))
        db.add(Report(
            reporter_id=created_users[6].id,
            reported_user_id=created_users[9].id,
            reason="Resource Link Query",
            description="Query about sharing external CTF tutorial links in chat.",
            status="resolved"
        ))

        db.commit()

        # Recalculate Trust Scores dynamically for all users
        print("Recalculating and verifying Trust Scores...")
        for u in created_users:
            calculate_and_update_trust_score(db, u.id)

        print("\n========================================================")
        print("SkillSwap 2.0 VIT Pune Database Seeded Successfully!")
        print("Admin Account: admin@vit.edu / AdminPass123!")
        print("Student Mentors: aarav.sharma@vit.edu, ananya.deshmukh@vit.edu, rohan.kulkarni@vit.edu (Password: Password123!)")
        print("Total Students: 25 | Total Skills: 35+ | Sessions: 22 | Reviews: 15")
        print("========================================================\n")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
