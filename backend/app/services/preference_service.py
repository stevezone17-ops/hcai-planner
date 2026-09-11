from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import UserPreference, ScheduleItem, Feedback

class PreferenceService:
    @staticmethod
    def get_preferences(db: Session, user_id: int = 1) -> List[UserPreference]:
        return db.query(UserPreference).filter(UserPreference.user_id == user_id).all()

    @staticmethod
    def get_preference_map(db: Session, user_id: int = 1) -> Dict[str, Any]:
        prefs = PreferenceService.get_preferences(db, user_id)
        result = {}
        for p in prefs:
            try:
                # Try numeric conversion
                if p.value.isdigit():
                    result[p.key] = int(p.value)
                else:
                    result[p.key] = p.value
            except Exception:
                result[p.key] = p.value
        return result

    @staticmethod
    def set_preference(db: Session, key: str, value: str, user_id: int = 1, source: str = "EXPLICIT", confidence: float = 0.8) -> UserPreference:
        pref = db.query(UserPreference).filter(UserPreference.user_id == user_id, UserPreference.key == key).first()
        if pref:
            pref.value = value
            pref.source = source
            pref.confidence = confidence
        else:
            pref = UserPreference(user_id=user_id, key=key, value=value, source=source, confidence=confidence)
            db.add(pref)
        db.commit()
        db.refresh(pref)
        return pref

    @staticmethod
    def update_learned_signals(db: Session, user_id: int = 1) -> Dict[str, Any]:
        """
        Scans feedback and schedule modifications to extract behavioral patterns.
        """
        # Find all modified items
        modified_items = db.query(ScheduleItem).filter(
            ScheduleItem.user_id == user_id,
            ScheduleItem.status == "MODIFIED",
            ScheduleItem.original_start.isnot(None)
        ).all()

        if not modified_items:
            return {"updated": False, "reason": "Not enough interaction data"}

        # Check hour shifts
        evening_count = 0
        morning_count = 0
        category_evening: Dict[str, int] = {}

        for item in modified_items:
            hour = item.start_time.hour
            if hour >= 17:
                evening_count += 1
                if item.task:
                    cat = item.task.category
                    category_evening[cat] = category_evening.get(cat, 0) + 1
            elif hour < 12:
                morning_count += 1

        signals_learned = 0
        if evening_count > morning_count:
            PreferenceService.set_preference(
                db, "preferred_focus_time", "Evening (17:00 - 21:00)", user_id, source="LEARNED", confidence=0.85
            )
            signals_learned += 1

        for cat, count in category_evening.items():
            if count >= 2:
                PreferenceService.set_preference(
                    db, f"category_time_{cat}", "18", user_id, source="LEARNED", confidence=0.90
                )
                signals_learned += 1

        return {"updated": True, "signals_learned": signals_learned}
