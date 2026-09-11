from datetime import datetime, timedelta, time
from sqlalchemy.orm import Session
from app.models.models import User, Task, Availability, ScheduleItem, Feedback, UserPreference

def seed_initial_data(db: Session):
    # Check if user exists
    user = db.query(User).first()
    if not user:
        user = User(
            name="Alex Morgan",
            email="alex.morgan@university.edu"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Check if availability exists
    if db.query(Availability).filter(Availability.user_id == user.id).count() == 0:
        # Mon-Fri: 09:00 - 13:00, 14:00 - 18:00
        # Sat-Sun: 10:00 - 14:00, 16:00 - 19:00
        avails = []
        for day in range(5):  # Mon-Fri
            avails.append(Availability(user_id=user.id, day_of_week=day, start_time="09:00", end_time="13:00"))
            avails.append(Availability(user_id=user.id, day_of_week=day, start_time="14:00", end_time="18:00"))
        for day in [5, 6]:  # Sat-Sun
            avails.append(Availability(user_id=user.id, day_of_week=day, start_time="10:00", end_time="14:00"))
            avails.append(Availability(user_id=user.id, day_of_week=day, start_time="16:00", end_time="19:00"))
        db.add_all(avails)
        db.commit()

    # Check if tasks exist
    if db.query(Task).filter(Task.user_id == user.id).count() == 0:
        now = datetime.utcnow()
        base_date = now.replace(hour=0, minute=0, second=0, microsecond=0)

        tasks_data = [
            {
                "title": "Presentation Preparation — Slide Deck & Speech",
                "description": "Finalize 15-minute pitch deck and speaking notes for research committee review.",
                "category": "Academic",
                "priority": "Critical",
                "duration_minutes": 120,
                "deadline": base_date + timedelta(days=1, hours=11),
                "preferred_start": "09:00",
                "preferred_end": "12:00",
                "difficulty": "Hard",
                "status": "SCHEDULED",
                "notes": "Must prepare live demo video fallback."
            },
            {
                "title": "Network Security Assignment — Vulnerability Assessment",
                "description": "Perform network scan analysis and write mitigation reports for CVSS 8.0+ findings.",
                "category": "Coursework",
                "priority": "High",
                "duration_minutes": 90,
                "deadline": base_date + timedelta(days=2, hours=17),
                "preferred_start": "14:00",
                "preferred_end": "17:00",
                "difficulty": "Medium",
                "status": "SCHEDULED",
                "notes": "Wireshark capture files in submission folder."
            },
            {
                "title": "DSA Practice — Trees & Dynamic Programming",
                "description": "Solve LeetCode Hard problems on segment trees and interval dynamic programming.",
                "category": "Coding",
                "priority": "High",
                "duration_minutes": 120,
                "deadline": base_date + timedelta(days=3, hours=20),
                "preferred_start": "18:00",
                "preferred_end": "20:00",
                "difficulty": "Hard",
                "status": "SCHEDULED",
                "notes": "Focus on space optimization."
            },
            {
                "title": "AI/ML Lab — PyTorch Model Training",
                "description": "Train Transformer-based sequence classification model and generate loss curves.",
                "category": "Research",
                "priority": "High",
                "duration_minutes": 90,
                "deadline": base_date + timedelta(days=3, hours=16),
                "preferred_start": "10:00",
                "preferred_end": "12:00",
                "difficulty": "Hard",
                "status": "SCHEDULED",
                "notes": "Run on GPU instance cluster."
            },
            {
                "title": "Database Assignment — B-Tree Indexing & Normalization",
                "description": "Write query execution plans comparing B-tree vs Hash indexes on 1M tuples.",
                "category": "Coursework",
                "priority": "Medium",
                "duration_minutes": 60,
                "deadline": base_date + timedelta(days=4, hours=18),
                "preferred_start": "15:00",
                "preferred_end": "17:00",
                "difficulty": "Medium",
                "status": "PENDING",
                "notes": "PostgreSQL EXPLAIN ANALYZE traces required."
            },
            {
                "title": "Project Development — HITL AI Task Planner",
                "description": "Implement frontend drag-and-drop timetable and adaptive feedback loops.",
                "category": "Project",
                "priority": "Critical",
                "duration_minutes": 180,
                "deadline": base_date + timedelta(days=5, hours=23),
                "preferred_start": "14:00",
                "preferred_end": "18:00",
                "difficulty": "Hard",
                "status": "PENDING",
                "notes": "Ensure responsive layout on mobile."
            },
            {
                "title": "Gym & High-Intensity Conditioning",
                "description": "Strength training upper body routine and 20 min cardio.",
                "category": "Personal",
                "priority": "Medium",
                "duration_minutes": 60,
                "deadline": base_date + timedelta(days=1, hours=20),
                "preferred_start": "17:00",
                "preferred_end": "19:00",
                "difficulty": "Easy",
                "status": "PENDING",
                "notes": "Stay hydrated."
            },
            {
                "title": "Research Paper Reading — Adaptive Scheduling Algorithms",
                "description": "Read and annotate 2 ACM SIGMOD papers on heuristic scheduling.",
                "category": "Reading",
                "priority": "Low",
                "duration_minutes": 45,
                "deadline": base_date + timedelta(days=6, hours=18),
                "preferred_start": "11:00",
                "preferred_end": "13:00",
                "difficulty": "Easy",
                "status": "PENDING",
                "notes": "Summarize key ideas into notes."
            }
        ]

        created_tasks = []
        for t_info in tasks_data:
            task = Task(**t_info, user_id=user.id)
            db.add(task)
            created_tasks.append(task)
        db.commit()

        for t in created_tasks:
            db.refresh(t)

        # Create realistic sample schedule items illustrating Human-in-the-Loop states!
        today_9am = base_date + timedelta(hours=9)
        today_11am = base_date + timedelta(hours=11)
        today_2pm = base_date + timedelta(hours=14)
        today_4pm = base_date + timedelta(hours=16)

        # 1. Locked item (Presentation Preparation)
        presentation_task = next(t for t in created_tasks if "Presentation" in t.title)
        item1 = ScheduleItem(
            user_id=user.id,
            task_id=presentation_task.id,
            start_time=today_9am,
            end_time=today_9am + timedelta(minutes=120),
            source="AI",
            status="LOCKED",
            locked=True,
            approved=True,
            ai_reason="Scheduled in morning focus block due to critical presentation deadline tomorrow. Locked by user as hard constraint.",
            confidence=0.96,
            original_start=today_9am,
            original_end=today_9am + timedelta(minutes=120)
        )
        db.add(item1)

        # 2. Accepted item (AI/ML Lab)
        aiml_task = next(t for t in created_tasks if "AI/ML" in t.title)
        item2 = ScheduleItem(
            user_id=user.id,
            task_id=aiml_task.id,
            start_time=today_11am + timedelta(minutes=30),
            end_time=today_11am + timedelta(minutes=120),
            source="AI",
            status="ACCEPTED",
            locked=False,
            approved=True,
            ai_reason="Optimal morning deep-work session placed immediately after your prime focus block.",
            confidence=0.92,
            original_start=today_11am + timedelta(minutes=30),
            original_end=today_11am + timedelta(minutes=120)
        )
        db.add(item2)

        # 3. Modified by User item (DSA Practice moved to evening)
        dsa_task = next(t for t in created_tasks if "DSA" in t.title)
        orig_dsa_start = today_2pm
        user_dsa_start = base_date + timedelta(hours=18)
        item3 = ScheduleItem(
            user_id=user.id,
            task_id=dsa_task.id,
            start_time=user_dsa_start,
            end_time=user_dsa_start + timedelta(minutes=120),
            source="USER",
            status="MODIFIED",
            locked=False,
            approved=True,
            ai_reason="Originally suggested for 14:00. User moved to preferred evening study session.",
            confidence=0.88,
            original_start=orig_dsa_start,
            original_end=orig_dsa_start + timedelta(minutes=120)
        )
        db.add(item3)

        # 4. Proposed item (Network Security)
        sec_task = next(t for t in created_tasks if "Network Security" in t.title)
        item4 = ScheduleItem(
            user_id=user.id,
            task_id=sec_task.id,
            start_time=today_2pm,
            end_time=today_2pm + timedelta(minutes=90),
            source="AI",
            status="PROPOSED",
            locked=False,
            approved=False,
            ai_reason="Scheduled in afternoon open slot ahead of approaching lab deadline. Awaiting user approval.",
            confidence=0.91,
            original_start=today_2pm,
            original_end=today_2pm + timedelta(minutes=90)
        )
        db.add(item4)

        db.commit()

        # Seed initial feedbacks
        feedbacks = [
            Feedback(user_id=user.id, schedule_item_id=item1.id, action="LOCK", reason="Crucial review with thesis advisor"),
            Feedback(user_id=user.id, schedule_item_id=item2.id, action="ACCEPT", reason="Good timing"),
            Feedback(user_id=user.id, schedule_item_id=item3.id, action="MODIFY", reason="I solve algorithmic coding problems much better after dinner", rating=5)
        ]
        db.add_all(feedbacks)

        # Seed initial preferences
        prefs = [
            UserPreference(user_id=user.id, key="preferred_focus_time", value="Morning", source="INITIAL", confidence=0.8),
            UserPreference(user_id=user.id, key="category_time_Coding", value="18", source="LEARNED", confidence=0.92),
            UserPreference(user_id=user.id, key="default_break_minutes", value="15", source="INITIAL", confidence=0.95),
            UserPreference(user_id=user.id, key="max_daily_work_hours", value="6.0", source="INITIAL", confidence=0.9)
        ]
        db.add_all(prefs)
        db.commit()
