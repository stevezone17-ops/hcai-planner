from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert "version" in res.json()

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_tasks_endpoints():
    res = client.get("/api/tasks")
    assert res.status_code == 200
    tasks = res.json()
    assert isinstance(tasks, list)
    assert len(tasks) > 0

    # Create new task
    new_task_payload = {
        "title": "API Test Lab Session",
        "description": "Integration test for automated endpoint checks",
        "category": "Testing",
        "priority": "High",
        "duration_minutes": 45,
        "difficulty": "Easy"
    }
    create_res = client.post("/api/tasks", json=new_task_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["title"] == "API Test Lab Session"
    assert created["id"] > 0

def test_schedule_and_hitl_actions():
    res = client.get("/api/schedule")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0

    item_id = items[0]["id"]
    # Test Approve
    appr_res = client.post(f"/api/schedule/{item_id}/approve")
    assert appr_res.status_code == 200
    assert appr_res.json()["success"] is True

    # Test Lock
    lock_res = client.post(f"/api/schedule/{item_id}/lock")
    assert lock_res.status_code == 200
    assert lock_res.json()["item"]["locked"] is True

    # Test Unlock
    unlock_res = client.post(f"/api/schedule/{item_id}/unlock")
    assert unlock_res.status_code == 200
    assert unlock_res.json()["item"]["locked"] is False

def test_analytics_api():
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "hitl_metrics" in data
    assert "schedule_efficiency" in data
    assert data["hitl_metrics"]["acceptance_rate"] >= 0

def test_what_if_simulation():
    res = client.post("/api/planner/what-if", json={
        "scenario_type": "lost_hours",
        "lost_hours": 3.0
    })
    assert res.status_code == 200
    data = res.json()
    assert "scenario_description" in data
    assert "simulated_items" in data
    assert "impact_summary" in data
    assert isinstance(data["simulated_items"], list)
