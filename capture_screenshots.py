"""
Capture UI screenshots by mocking API responses (no real backend needed).
"""
import os, json
from playwright.sync_api import sync_playwright, Route

BASE   = "http://localhost:3000"
OUTDIR = r"c:\SVU\S25\gProject_Mhd\front_project\screenshots"
os.makedirs(OUTDIR, exist_ok=True)

EXE = r"C:\Users\HP\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"

# ── Mock data ─────────────────────────────────────────────────────────────────
MOCK_LOGIN = {
    "access":  "mock.access.token",
    "refresh": "mock.refresh.token",
    "user": {"id": 1, "username": "Mhd_ismaeal", "role": "admin",
             "first_name": "محمد", "last_name": "إسماعيل",
             "email": "mhd@example.com"}
}

MOCK_PROFILE = {"id": 1, "username": "Mhd_ismaeal", "specialization": "علوم الحاسوب",
                "role": "admin", "first_name": "محمد", "last_name": "إسماعيل"}

MOCK_QUIZZES = {"results": [
    {"id": 45, "title": "اختبار مادة الفيزياء", "description": "اختبار شامل لمادة الفيزياء العامة للفصل الأول",
     "category": "علوم", "time_limit": 30, "attempts_allowed": 3,
     "is_published": True, "question_count": 10, "total_points": 20,
     "creator_name": "أ. محمد إسماعيل", "created_at": "2025-08-01"},
    {"id": 46, "title": "اختبار الرياضيات التفاضلية", "description": "اختبار التفاضل والتكامل",
     "category": "رياضيات", "time_limit": 45, "attempts_allowed": 2,
     "is_published": True, "question_count": 15, "total_points": 30,
     "creator_name": "أ. أحمد غديب", "created_at": "2025-08-05"},
    {"id": 47, "title": "اختبار البرمجة بلغة Python", "description": "أساسيات البرمجة بلغة بايثون",
     "category": "حاسوب", "time_limit": 60, "attempts_allowed": 5,
     "is_published": False, "question_count": 12, "total_points": 24,
     "creator_name": "أ. محمد إسماعيل", "created_at": "2025-08-10"},
    {"id": 48, "title": "اختبار قواعد البيانات", "description": "SQL والمفاهيم الأساسية",
     "category": "حاسوب", "time_limit": 40, "attempts_allowed": 3,
     "is_published": True, "question_count": 8, "total_points": 16,
     "creator_name": "أ. أحمد غديب", "created_at": "2025-08-12"},
]}

MOCK_ATTEMPTS = [
    {"id": 308, "quiz_title": "اختبار مادة الفيزياء", "quiz_category": "علوم",
     "instructor_name": "أ. محمد إسماعيل", "status": "completed",
     "started_at": "2025-08-20T10:00:00Z", "completed_at": "2025-08-20T10:25:00Z",
     "score": 18, "correct_answers": 9, "total_questions": 10},
    {"id": 310, "quiz_title": "اختبار الرياضيات التفاضلية", "quiz_category": "رياضيات",
     "instructor_name": "أ. أحمد غديب", "status": "completed",
     "started_at": "2025-08-22T14:00:00Z", "completed_at": "2025-08-22T14:40:00Z",
     "score": 24, "correct_answers": 12, "total_questions": 15},
    {"id": 315, "quiz_title": "اختبار قواعد البيانات", "quiz_category": "حاسوب",
     "instructor_name": "أ. أحمد غديب", "status": "completed",
     "started_at": "2025-08-25T09:00:00Z", "completed_at": "2025-08-25T09:35:00Z",
     "score": 12, "correct_answers": 6, "total_questions": 8},
]

MOCK_QUIZ_QUESTIONS = {"id": 45, "title": "اختبار مادة الفيزياء", "time_limit": 30,
    "questions": [
        {"id": 1, "question_text": "ما هو قانون نيوتن الأول؟",
         "question_type": "mcq", "points": 2,
         "choices": [
             {"id": 1, "choice_text": "قانون القصور الذاتي"},
             {"id": 2, "choice_text": "قانون التسارع"},
             {"id": 3, "choice_text": "قانون الفعل ورد الفعل"},
             {"id": 4, "choice_text": "قانون الجاذبية"},
         ]},
        {"id": 2, "question_text": "ما هي وحدة قياس القوة في النظام الدولي؟",
         "question_type": "mcq", "points": 2,
         "choices": [
             {"id": 5, "choice_text": "واط"},
             {"id": 6, "choice_text": "نيوتن"},
             {"id": 7, "choice_text": "جول"},
             {"id": 8, "choice_text": "أمبير"},
         ]},
    ]}

MOCK_ATTEMPT_START = {"id": 320, "attempt_id": 320}

MOCK_RESULTS = {
    "quiz": {"id": 45, "title": "اختبار مادة الفيزياء"},
    "statistics": {
        "total_students": 24, "average_score": 76.4,
        "highest_score": 100, "lowest_score": 40,
        "passed": 18, "failed": 6, "passing_percentage": 75.0
    },
    "attempts": [
        {"student_name": "علي محمد", "username": "ali_m", "score": 18,
         "correct_answers": 9, "incorrect_answers": 1, "total_questions": 10,
         "time_taken_minutes": 22.5, "start_time": "2025-08-20T10:00:00Z",
         "completed_at": "2025-08-20T10:25:00Z", "status": "completed"},
        {"student_name": "سارة أحمد", "username": "sara_a", "score": 20,
         "correct_answers": 10, "incorrect_answers": 0, "total_questions": 10,
         "time_taken_minutes": 18.3, "start_time": "2025-08-20T10:40:00Z",
         "completed_at": "2025-08-20T11:00:00Z", "status": "completed"},
        {"student_name": "خالد عمر", "username": "khaled_o", "score": 14,
         "correct_answers": 7, "incorrect_answers": 3, "total_questions": 10,
         "time_taken_minutes": 28.0, "start_time": "2025-08-21T08:47:00Z",
         "completed_at": "2025-08-21T09:15:00Z", "status": "completed"},
        {"student_name": "ريم سالم", "username": "reem_s", "score": 16,
         "correct_answers": 8, "incorrect_answers": 2, "total_questions": 10,
         "time_taken_minutes": 25.1, "start_time": "2025-08-21T09:35:00Z",
         "completed_at": "2025-08-21T10:00:00Z", "status": "completed"},
        {"student_name": "يوسف ناصر", "username": "yousef_n", "score": 8,
         "correct_answers": 4, "incorrect_answers": 6, "total_questions": 10,
         "time_taken_minutes": 29.8, "start_time": "2025-08-22T08:00:00Z",
         "completed_at": "2025-08-22T08:30:00Z", "status": "completed"},
    ]
}

MOCK_ATTEMPT_DETAIL = {
    "id": 308, "quiz_title": "اختبار مادة الفيزياء",
    "status": "completed", "score": 18,
    "correct_answers": 9, "total_questions": 10,
    "answers": [
        {"id": 1, "question_text": "ما هو قانون نيوتن الأول؟",
         "question_type": "mcq", "points": 2, "is_correct": True,
         "answered_at": "2025-08-20T10:05:00Z",
         "selected_choice": None, "selected_choice_ids": [1],
         "choices": [
             {"id": 1, "choice_text": "قانون القصور الذاتي", "is_correct": True},
             {"id": 2, "choice_text": "قانون التسارع", "is_correct": False},
             {"id": 3, "choice_text": "قانون الفعل ورد الفعل", "is_correct": False},
             {"id": 4, "choice_text": "قانون الجاذبية", "is_correct": False},
         ]},
        {"id": 2, "question_text": "ما هي وحدة قياس القوة في النظام الدولي؟",
         "question_type": "mcq", "points": 2, "is_correct": False,
         "answered_at": "2025-08-20T10:07:00Z",
         "selected_choice": None, "selected_choice_ids": [5],
         "choices": [
             {"id": 5, "choice_text": "واط", "is_correct": False},
             {"id": 6, "choice_text": "نيوتن", "is_correct": True},
             {"id": 7, "choice_text": "جول", "is_correct": False},
             {"id": 8, "choice_text": "أمبير", "is_correct": False},
         ]},
    ]
}

MOCK_RESULT_PAGE = {
    "id": 308, "quiz_title": "اختبار مادة الفيزياء",
    "status": "completed", "score": 18,
    "correct_answers": 9, "total_questions": 10, "passed": True
}


def mock_api(route: Route, data: dict | list, status: int = 200):
    route.fulfill(status=status,
                  content_type="application/json",
                  body=json.dumps(data, ensure_ascii=False))


def inject_auth(page):
    """Set localStorage to simulate a logged-in admin user."""
    page.evaluate("""() => {
        localStorage.setItem('access_token', 'mock.access.token');
        localStorage.setItem('refresh_token', 'mock.refresh.token');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('user', JSON.stringify({
            id: 1, username: 'Mhd_ismaeal', role: 'admin',
            first_name: 'محمد', last_name: 'إسماعيل'
        }));
        localStorage.setItem('current_quiz', JSON.stringify({
            id: 45, title: 'اختبار مادة الفيزياء', time_limit: 30
        }));
        localStorage.setItem('current_attempt_id', '308');
    }""")


def shot(page, name, wait=1800):
    page.wait_for_timeout(wait)
    path = os.path.join(OUTDIR, f"{name}.png")
    page.screenshot(path=path, full_page=False)
    print(f"  [OK]  {name}.png")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=EXE, args=["--no-sandbox"])

    # ── HELPER: fresh context with API mocks ──────────────────────────────────
    def new_ctx():
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        pg = ctx.new_page()
        # intercept all /api/* calls
        pg.route("**/api/auth/login/**",    lambda r: mock_api(r, MOCK_LOGIN))
        pg.route("**/api/auth/profile/**",  lambda r: mock_api(r, MOCK_PROFILE))
        pg.route("**/api/quizzes/*/start/**", lambda r: mock_api(r, MOCK_ATTEMPT_START))
        pg.route("**/api/quizzes/*/",       lambda r: mock_api(r, MOCK_QUIZZES["results"][0]))
        pg.route("**/api/quizzes/",         lambda r: mock_api(r, MOCK_QUIZZES))
        pg.route("**/api/student/attempts/308",  lambda r: mock_api(r, MOCK_ATTEMPT_DETAIL))
        pg.route("**/api/student/attempts/**",   lambda r: mock_api(r, MOCK_ATTEMPTS))
        pg.route("**/api/instructor/quizzes/**/results/**", lambda r: mock_api(r, MOCK_RESULTS))
        pg.route("**/api/questions/**",      lambda r: mock_api(r, {"id": 99}))
        pg.route("**/api/auth/account-status/**", lambda r: mock_api(r, {"active": True}))
        pg.route("**/api/auth/refresh/**",   lambda r: mock_api(r, {"access": "mock.access.token"}))
        return ctx, pg

    # ────────────────────────────────────────────────────────────────────────
    # 1. Login page
    # ────────────────────────────────────────────────────────────────────────
    print("1. Login page")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/login", wait_until="networkidle")
    shot(page, "01_login")
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 2. Register page
    # ────────────────────────────────────────────────────────────────────────
    print("2. Register page")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/register", wait_until="networkidle")
    shot(page, "02_register")
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 3. Dashboard
    # ────────────────────────────────────────────────────────────────────────
    print("3. Dashboard")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/dashboard", wait_until="networkidle")
    shot(page, "03_dashboard", wait=2200)
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 4. Quiz page (taking a quiz)
    # ────────────────────────────────────────────────────────────────────────
    print("4. Quiz page")
    ctx, page = new_ctx()
    page.route("**/api/quizzes/45/**", lambda r: mock_api(r, MOCK_QUIZ_QUESTIONS))
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/quiz/45", wait_until="networkidle")
    shot(page, "04_quiz_taking", wait=2200)
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 5. Quiz result
    # ────────────────────────────────────────────────────────────────────────
    print("5. Quiz result")
    ctx, page = new_ctx()
    page.route("**/api/student/attempts/308**", lambda r: mock_api(r, MOCK_RESULT_PAGE))
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/quiz/result/308", wait_until="networkidle")
    shot(page, "05_quiz_result", wait=2200)
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 6. Student attempts list
    # ────────────────────────────────────────────────────────────────────────
    print("6. Student attempts list")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/student/attempts", wait_until="networkidle")
    shot(page, "06_student_attempts", wait=2200)
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 7. Attempt detail / review
    # ────────────────────────────────────────────────────────────────────────
    print("7. Attempt detail")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/student/attempts/308", wait_until="networkidle")
    shot(page, "07_attempt_detail", wait=2500)
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 8. Admin quizzes list
    # ────────────────────────────────────────────────────────────────────────
    print("8. Admin quiz management")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/admin/quizzes", wait_until="networkidle")
    shot(page, "08_admin_quizzes", wait=2200)
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 9. Create quiz
    # ────────────────────────────────────────────────────────────────────────
    print("9. Create quiz")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/admin/quizzes/create", wait_until="networkidle")
    shot(page, "09_create_quiz", wait=1500)
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 10. Add question
    # ────────────────────────────────────────────────────────────────────────
    print("10. Add question")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/admin/quizzes/45/add-question", wait_until="networkidle")
    shot(page, "10_add_question", wait=1500)
    ctx.close()

    # ────────────────────────────────────────────────────────────────────────
    # 11. Quiz results (instructor)
    # ────────────────────────────────────────────────────────────────────────
    print("11. Quiz results (instructor)")
    ctx, page = new_ctx()
    page.goto(f"{BASE}/login", wait_until="networkidle")
    inject_auth(page)
    page.goto(f"{BASE}/admin/quizzes/45/results", wait_until="networkidle")
    shot(page, "11_quiz_results", wait=2200)
    ctx.close()

    browser.close()

print(f"\nDone! Screenshots saved to: {OUTDIR}")
files = sorted(f for f in os.listdir(OUTDIR) if f.endswith('.png'))
for f in files:
    kb = os.path.getsize(os.path.join(OUTDIR, f)) // 1024
    print(f"  {f}  ({kb} KB)")
