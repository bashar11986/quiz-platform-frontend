"""
Generate Frontend_Presentation.pptx with embedded UI screenshots.
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from lxml import etree
import os

# ── Palette ───────────────────────────────────────────────────────────────────
BLUE_DARK  = RGBColor(0x1E, 0x3A, 0x8A)
BLUE_MID   = RGBColor(0x25, 0x63, 0xEB)
BLUE_LIGHT = RGBColor(0xDB, 0xEA, 0xFE)
ACCENT     = RGBColor(0x06, 0xB6, 0xD4)
GREEN      = RGBColor(0x05, 0x96, 0x69)
GRAY_DARK  = RGBColor(0x1F, 0x29, 0x37)
GRAY_MID   = RGBColor(0x4B, 0x55, 0x63)
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
ORANGE     = RGBColor(0xF5, 0x9E, 0x0B)
PURPLE     = RGBColor(0x7C, 0x3A, 0xED)
NAVY_FT    = RGBColor(0x0A, 0x15, 0x35)

SLIDE_W = Inches(13.33)
SLIDE_H = Inches(7.5)
IMGS    = r"c:\SVU\S25\gProject_Mhd\front_project\screenshots"

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H
blank = prs.slide_layouts[6]


# ── Primitives ────────────────────────────────────────────────────────────────
def rect(slide, l, t, w, h, clr):
    s = slide.shapes.add_shape(1, l, t, w, h)
    s.fill.solid(); s.fill.fore_color.rgb = clr
    s.line.fill.background()
    return s

def txt(slide, text, l, t, w, h, size=16, bold=False, clr=GRAY_DARK,
        align=PP_ALIGN.RIGHT, italic=False):
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame; tf.word_wrap = True
    p  = tf.paragraphs[0]; p.alignment = align
    r  = p.add_run()
    r.text = text; r.font.size = Pt(size); r.font.bold = bold
    r.font.italic = italic; r.font.color.rgb = clr; r.font.name = "Arial"
    pPr = p._p.get_or_add_pPr(); pPr.set(qn("a:rtl"), "1")
    return tb

def bullets(slide, items, l, t, w, h, size=14, clr=GRAY_MID, bc=BLUE_MID):
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame; tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.RIGHT
        rb = p.add_run(); rb.text = "◆  "
        rb.font.size = Pt(size-2); rb.font.color.rgb = bc; rb.font.name = "Arial"
        ri = p.add_run(); ri.text = item
        ri.font.size = Pt(size); ri.font.color.rgb = clr; ri.font.name = "Arial"
        pPr = p._p.get_or_add_pPr(); pPr.set(qn("a:rtl"), "1")
        lnSpc = etree.SubElement(pPr, qn("a:lnSpc"))
        spcPct = etree.SubElement(lnSpc, qn("a:spcPct")); spcPct.set("val", "120000")

def img(slide, path, l, t, w, h=None):
    if not os.path.exists(path):
        return
    if h:
        slide.shapes.add_picture(path, l, t, w, h)
    else:
        slide.shapes.add_picture(path, l, t, w)

def header(slide, title, subtitle=None):
    """Standard dark header bar."""
    rect(slide, 0, 0, SLIDE_W, Inches(1.4), BLUE_DARK)
    rect(slide, 0, 0, Inches(0.12), SLIDE_H, ACCENT)
    txt(slide, title, Inches(0.5), Inches(0.2), Inches(12), Inches(0.85),
        size=28, bold=True, clr=WHITE, align=PP_ALIGN.RIGHT)
    if subtitle:
        txt(slide, subtitle, Inches(0.5), Inches(0.95), Inches(12), Inches(0.4),
            size=13, clr=ACCENT, align=PP_ALIGN.RIGHT, italic=True)

def footer(slide, n):
    rect(slide, 0, SLIDE_H - Inches(0.42), SLIDE_W, Inches(0.42), NAVY_FT)
    txt(slide, f"Frontend — Slide {n} / 8",
        Inches(0.3), SLIDE_H - Inches(0.4), Inches(6), Inches(0.38),
        size=11, clr=BLUE_LIGHT, align=PP_ALIGN.LEFT)
    txt(slide, "منصة الاختبارات الإلكترونية",
        Inches(6), SLIDE_H - Inches(0.4), Inches(7), Inches(0.38),
        size=11, clr=BLUE_LIGHT, align=PP_ALIGN.RIGHT)

def shadow_frame(slide, l, t, w, h):
    """Light shadow frame behind a screenshot."""
    rect(slide, l + Inches(0.04), t + Inches(0.04), w, h, RGBColor(0xCC, 0xCC, 0xCC))
    rect(slide, l, t, w, h, WHITE)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — Title
# ══════════════════════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(blank)
rect(sl, 0, 0, SLIDE_W, SLIDE_H, BLUE_DARK)
rect(sl, SLIDE_W - Inches(0.18), 0, Inches(0.18), SLIDE_H, ACCENT)
rect(sl, 0, 0, SLIDE_W, Inches(0.08), ACCENT)

# Left collage strip (3 stacked screenshots, rotated feel)
for i, name, y in [
    (0, "03_dashboard.png", Inches(0.5)),
    (1, "08_admin_quizzes.png", Inches(2.5)),
    (2, "06_student_attempts.png", Inches(4.5)),
]:
    p = os.path.join(IMGS, name)
    if os.path.exists(p):
        shadow_frame(sl, Inches(0.3), y, Inches(4.5), Inches(1.85))
        img(sl, p, Inches(0.3), y, Inches(4.5), Inches(1.85))

# Main title block
txt(sl, "منصة الاختبارات الإلكترونية",
    Inches(4.9), Inches(1.5), Inches(8.2), Inches(1.0),
    size=38, bold=True, clr=WHITE, align=PP_ALIGN.CENTER)
txt(sl, "واجهة المستخدم الأمامية — Frontend",
    Inches(4.9), Inches(2.55), Inches(8.2), Inches(0.6),
    size=22, clr=ACCENT, align=PP_ALIGN.CENTER, italic=True)
rect(sl, Inches(6.0), Inches(3.3), Inches(6.0), Inches(0.05), ACCENT)
txt(sl, "Next.js 16  ·  React 19  ·  TypeScript  ·  Tailwind CSS v4",
    Inches(4.9), Inches(3.45), Inches(8.2), Inches(0.45),
    size=15, clr=BLUE_LIGHT, align=PP_ALIGN.CENTER)
txt(sl, "2025 — مشروع تخرج",
    Inches(4.9), Inches(4.0), Inches(8.2), Inches(0.4),
    size=14, clr=BLUE_LIGHT, align=PP_ALIGN.CENTER)
footer(sl, 1)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — Overview  (screenshot collage on right)
# ══════════════════════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(blank)
rect(sl, 0, 0, SLIDE_W, SLIDE_H, WHITE)
header(sl, "نظرة عامة على الجزء الأمامي", "11 صفحة — 3 أدوار: طالب / محاضر / مشرف")

# Left text
txt(sl, "ما الذي تم بناؤه؟",
    Inches(0.4), Inches(1.55), Inches(6.2), Inches(0.45),
    size=18, bold=True, clr=BLUE_DARK)
bullets(sl, [
    "واجهة مستخدم متكاملة تربط الطلاب بالمحاضرين والإداريين",
    "تتصل بـ Django REST Backend عبر Proxy داخلي",
    "مصادقة JWT مع تجديد تلقائي للجلسة",
    "دعم كامل للغة العربية (RTL)",
], Inches(0.4), Inches(2.05), Inches(6.0), Inches(1.6), size=14)

for clr, t, b, y in [
    (BLUE_MID, "للطالب", "تسجيل الدخول · أداء الاختبارات\nعرض النتائج · مراجعة المحاولات", Inches(3.8)),
    (GREEN,    "للمحاضر/الأدمن", "إنشاء الاختبارات · إضافة الأسئلة\nنشر الاختبار · عرض نتائج الطلاب", Inches(4.75)),
    (ORANGE,   "تقني", "App Router · JWT · Proxy API\nRefresh Token تلقائي", Inches(5.7)),
]:
    rect(sl, Inches(0.4), y, Inches(6.0), Inches(0.82), clr)
    txt(sl, t, Inches(0.4), y + Inches(0.04), Inches(1.4), Inches(0.75),
        size=13, bold=True, clr=WHITE, align=PP_ALIGN.CENTER)
    txt(sl, b, Inches(1.85), y + Inches(0.05), Inches(4.5), Inches(0.75),
        size=12, clr=WHITE, align=PP_ALIGN.RIGHT)

# Right: 4 screenshots in 2x2 grid
positions = [
    ("01_login.png",        Inches(6.7),  Inches(1.5)),
    ("03_dashboard.png",    Inches(9.95), Inches(1.5)),
    ("06_student_attempts.png", Inches(6.7), Inches(4.3)),
    ("11_quiz_results.png", Inches(9.95), Inches(4.3)),
]
for name, x, y in positions:
    p = os.path.join(IMGS, name)
    shadow_frame(sl, x, y, Inches(3.1), Inches(2.65))
    img(sl, p, x, y, Inches(3.1), Inches(2.65))

footer(sl, 2)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — Tech Stack
# ══════════════════════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(blank)
rect(sl, 0, 0, SLIDE_W, SLIDE_H, RGBColor(0xF8, 0xFA, 0xFF))
header(sl, "التقنيات والأدوات المستخدمة")

tech_cards = [
    (BLUE_MID, "Next.js 16.2.9",   "App Router, Turbopack\nAPI Routes, Middleware\nFile-based Routing"),
    (GREEN,    "React 19.2.4",     "Hooks: useState, useEffect\nuseParams, useRouter\nClient Components"),
    (ACCENT,   "TypeScript",       "Type-safe interfaces\nStatic typing\nGenerics & Enums"),
    (ORANGE,   "Tailwind CSS v4",  "Utility-first styling\nResponsive Grid\nRTL & Arabic support"),
    (PURPLE,   "JWT Auth",         "Access + Refresh Tokens\nlocalStorage + Cookie\nSilent Refresh"),
    (RGBColor(0xE1,0x1D,0x48), "API Proxy Catch-all", "CORS bypass\nTrailing slash handling\nDjango REST Backend"),
]

cw, ch = Inches(3.95), Inches(2.2)
sx, sy, gx, gy = Inches(0.35), Inches(1.6), Inches(0.22), Inches(0.22)
for i, (clr, title, body) in enumerate(tech_cards):
    row, col = divmod(i, 3)
    x = sx + col * (cw + gx)
    y = sy + row * (ch + gy)
    rect(sl, x, y, cw, Inches(0.52), clr)
    txt(sl, title, x, y+Inches(0.02), cw, Inches(0.5),
        size=15, bold=True, clr=WHITE, align=PP_ALIGN.CENTER)
    rect(sl, x, y+Inches(0.52), cw, ch-Inches(0.52), WHITE)
    txt(sl, body, x+Inches(0.1), y+Inches(0.6), cw-Inches(0.2), ch-Inches(0.65),
        size=13, clr=GRAY_DARK, align=PP_ALIGN.RIGHT)

footer(sl, 3)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — Auth: Login + Register  (screenshots as main content)
# ══════════════════════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(blank)
rect(sl, 0, 0, SLIDE_W, SLIDE_H, WHITE)
header(sl, "المصادقة وإدارة الجلسة", "تسجيل الدخول · إنشاء حساب · تجديد الجلسة تلقائياً")

# Login section (right half)
rect(sl, Inches(6.8), Inches(1.5), Inches(6.35), Inches(5.5), BLUE_LIGHT)
txt(sl, "صفحة تسجيل الدخول  /login",
    Inches(6.9), Inches(1.55), Inches(6.1), Inches(0.48),
    size=15, bold=True, clr=BLUE_DARK)
shadow_frame(sl, Inches(6.9), Inches(2.1), Inches(3.2), Inches(2.4))
img(sl, os.path.join(IMGS, "01_login.png"), Inches(6.9), Inches(2.1), Inches(3.2), Inches(2.4))
bullets(sl, [
    "POST /api/auth/login/",
    "تخزين: access_token, refresh_token",
    "Cookie للـ Middleware + userRole",
    "Toast للنجاح والخطأ",
    "رابط → /register",
], Inches(10.15), Inches(2.1), Inches(2.85), Inches(2.4), size=12, bc=BLUE_MID)

# Register section (left half)
rect(sl, Inches(0.25), Inches(1.5), Inches(6.3), Inches(5.5), RGBColor(0xEC,0xFF,0xF5))
txt(sl, "صفحة إنشاء حساب  /register",
    Inches(0.35), Inches(1.55), Inches(6.1), Inches(0.48),
    size=15, bold=True, clr=GREEN)
shadow_frame(sl, Inches(0.35), Inches(2.1), Inches(3.2), Inches(2.4))
img(sl, os.path.join(IMGS, "02_register.png"), Inches(0.35), Inches(2.1), Inches(3.2), Inches(2.4))
bullets(sl, [
    "POST /api/auth/register/",
    "حقول: الاسم، المستخدم، البريد، التخصص",
    "التحقق من تطابق كلمة المرور",
    "توجيه تلقائي للـ Dashboard",
], Inches(3.6), Inches(2.1), Inches(2.8), Inches(2.4), size=12, bc=GREEN)

# Refresh token footer strip
rect(sl, Inches(0.25), Inches(5.3), Inches(12.9), Inches(1.6), RGBColor(0xFF,0xF7,0xE6))
txt(sl, "آلية التجديد التلقائي — Silent Token Refresh",
    Inches(0.4), Inches(5.34), Inches(12.7), Inches(0.42),
    size=14, bold=True, clr=ORANGE)
txt(sl, "401 ← إرسال Refresh Token ← الحصول على Access جديد ← إعادة الطلب / أو مسح الجلسة والتوجيه لـ /login",
    Inches(0.4), Inches(5.78), Inches(12.7), Inches(0.95),
    size=13, clr=GRAY_DARK)
footer(sl, 4)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — Dashboard + Quiz (full-width screenshots)
# ══════════════════════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(blank)
rect(sl, 0, 0, SLIDE_W, SLIDE_H, RGBColor(0xF8,0xFA,0xFF))
header(sl, "لوحة التحكم الرئيسية وتجربة الاختبار")

# Flow arrows
for i, (lbl, clr) in enumerate([
    ("لوحة التحكم /dashboard", BLUE_MID),
    ("أداء الاختبار /quiz/[id]", GREEN),
    ("النتيجة /quiz/result/[id]", ORANGE),
]):
    x = Inches(0.3 + i * 4.33)
    rect(sl, x, Inches(1.5), Inches(4.0), Inches(0.62), clr)
    txt(sl, lbl, x, Inches(1.54), Inches(4.0), Inches(0.55),
        size=13, bold=True, clr=WHITE, align=PP_ALIGN.CENTER)
    if i < 2:
        txt(sl, "->", Inches(4.3 + i*4.33), Inches(1.6), Inches(0.42), Inches(0.45),
            size=20, bold=True, clr=BLUE_MID, align=PP_ALIGN.CENTER)

# Dashboard screenshot (large, left)
shadow_frame(sl, Inches(0.25), Inches(2.25), Inches(7.8), Inches(4.75))
img(sl, os.path.join(IMGS, "03_dashboard.png"), Inches(0.25), Inches(2.25), Inches(7.8), Inches(4.75))

# Quiz + Result small screenshots (right column)
shadow_frame(sl, Inches(8.25), Inches(2.25), Inches(4.85), Inches(2.3))
img(sl, os.path.join(IMGS, "04_quiz_taking.png"), Inches(8.25), Inches(2.25), Inches(4.85), Inches(2.3))

shadow_frame(sl, Inches(8.25), Inches(4.7), Inches(4.85), Inches(2.3))
img(sl, os.path.join(IMGS, "05_quiz_result.png"), Inches(8.25), Inches(4.7), Inches(4.85), Inches(2.3))

txt(sl, "بدء الاختبار", Inches(8.25), Inches(4.55), Inches(2.3), Inches(0.3),
    size=11, bold=True, clr=GREEN, align=PP_ALIGN.RIGHT)
txt(sl, "النتيجة النهائية", Inches(8.25), Inches(6.97), Inches(2.3), Inches(0.3),
    size=11, bold=True, clr=ORANGE, align=PP_ALIGN.RIGHT)

footer(sl, 5)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — Student Attempts
# ══════════════════════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(blank)
rect(sl, 0, 0, SLIDE_W, SLIDE_H, WHITE)
header(sl, "سجل محاولات الطالب ومراجعة الأسئلة")

# Attempts list screenshot (large, right)
shadow_frame(sl, Inches(6.75), Inches(1.5), Inches(6.35), Inches(3.35))
img(sl, os.path.join(IMGS, "06_student_attempts.png"), Inches(6.75), Inches(1.5), Inches(6.35), Inches(3.35))
txt(sl, "/student/attempts", Inches(6.75), Inches(4.88), Inches(6.35), Inches(0.32),
    size=11, bold=True, clr=BLUE_MID, align=PP_ALIGN.CENTER)

# Attempt detail screenshot (bottom right)
shadow_frame(sl, Inches(6.75), Inches(5.25), Inches(6.35), Inches(1.75))
img(sl, os.path.join(IMGS, "07_attempt_detail.png"), Inches(6.75), Inches(5.25), Inches(6.35), Inches(1.75))
txt(sl, "/student/attempts/[id]", Inches(6.75), Inches(6.98), Inches(6.35), Inches(0.32),
    size=11, bold=True, clr=PURPLE, align=PP_ALIGN.CENTER)

# Left: text
rect(sl, Inches(0.25), Inches(1.5), Inches(6.25), Inches(1.1), BLUE_MID)
txt(sl, "صفحة سجل المحاولات", Inches(0.35), Inches(1.55), Inches(6.0), Inches(0.5),
    size=15, bold=True, clr=WHITE)
bullets(sl, [
    "GET /api/student/attempts/",
    "4 بطاقات: إجمالي، مكتمل، متوسط، أعلى",
    "جدول: اسم الاختبار، التاريخ، النسبة، الحالة",
    "زر عرض النتيجة + زر مراجعة الأسئلة",
], Inches(0.25), Inches(2.65), Inches(6.25), Inches(1.6), size=13)

rect(sl, Inches(0.25), Inches(4.35), Inches(6.25), Inches(1.1), PURPLE)
txt(sl, "صفحة مراجعة المحاولة", Inches(0.35), Inches(4.4), Inches(6.0), Inches(0.5),
    size=15, bold=True, clr=WHITE)
bullets(sl, [
    "GET /api/student/attempts/{id}  (بدون trailing slash)",
    "كل سؤال مع خياراته: أخضر=صحيح، أحمر=خاطئ",
    "selected_choice_ids[] لتحديد اختيار الطالب",
    "اشتقاق الحالة من is_correct + answered_at",
], Inches(0.25), Inches(5.5), Inches(6.25), Inches(1.6), size=13, bc=PURPLE)

footer(sl, 6)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — Admin / Instructor Panel
# ══════════════════════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(blank)
rect(sl, 0, 0, SLIDE_W, SLIDE_H, RGBColor(0xF8,0xFA,0xFF))
header(sl, "لوحة تحكم المحاضر والإداري", "إدارة الاختبارات · إنشاء · إضافة أسئلة · النتائج")

# Admin quizzes list (top right)
shadow_frame(sl, Inches(6.75), Inches(1.5), Inches(6.35), Inches(2.85))
img(sl, os.path.join(IMGS, "08_admin_quizzes.png"), Inches(6.75), Inches(1.5), Inches(6.35), Inches(2.85))
txt(sl, "إدارة الاختبارات /admin/quizzes", Inches(6.75), Inches(4.38), Inches(6.35), Inches(0.3),
    size=11, bold=True, clr=GREEN, align=PP_ALIGN.CENTER)

# Quiz results (bottom right)
shadow_frame(sl, Inches(6.75), Inches(4.75), Inches(6.35), Inches(2.27))
img(sl, os.path.join(IMGS, "11_quiz_results.png"), Inches(6.75), Inches(4.75), Inches(6.35), Inches(2.27))
txt(sl, "نتائج الاختبار /admin/quizzes/[id]/results", Inches(6.75), Inches(7.03), Inches(6.35), Inches(0.3),
    size=11, bold=True, clr=PURPLE, align=PP_ALIGN.CENTER)

# Left: 4 feature blocks
blocks = [
    (GREEN,   "إدارة الاختبارات", ["عرض كل الاختبارات في جدول", "تبديل حالة النشر is_published", "روابط لإضافة أسئلة وعرض النتائج"]),
    (BLUE_MID,"إنشاء اختبار",    ["POST /api/quizzes/", "العنوان، الوصف، التصنيف، الوقت"]),
    (ORANGE,  "إضافة أسئلة",     ["POST /api/questions/", "MCQ + إجابة قصيرة + النقاط"]),
    (PURPLE,  "نتائج الاختبار",  ["إحصاءات: المتوسط، الأعلى، الأدنى", "جدول الطلاب مع بحث فوري"]),
]
for i, (clr, title, pts) in enumerate(blocks):
    y = Inches(1.5 + i * 1.45)
    rect(sl, Inches(0.25), y, Inches(6.25), Inches(0.5), clr)
    txt(sl, title, Inches(0.35), y+Inches(0.04), Inches(6.0), Inches(0.44),
        size=14, bold=True, clr=WHITE)
    for j, pt in enumerate(pts):
        txt(sl, f"◆  {pt}", Inches(0.35), y+Inches(0.54+j*0.35), Inches(6.0), Inches(0.38),
            size=12, clr=GRAY_DARK)

footer(sl, 7)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 8 — Architecture & All Pages
# ══════════════════════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(blank)
rect(sl, 0, 0, SLIDE_W, SLIDE_H, BLUE_DARK)
rect(sl, 0, 0, Inches(0.12), SLIDE_H, ACCENT)
rect(sl, 0, 0, SLIDE_W, Inches(0.08), ACCENT)

txt(sl, "البنية التقنية والصفحات المنجزة",
    Inches(0.4), Inches(0.18), Inches(12.5), Inches(0.7),
    size=26, bold=True, clr=WHITE, align=PP_ALIGN.RIGHT)

# Architecture layers
for i, (lbl, clr, x) in enumerate([
    ("المتصفح",         ACCENT,    Inches(0.3)),
    ("Next.js Pages",   BLUE_MID,  Inches(3.6)),
    ("API Proxy",       ORANGE,    Inches(6.9)),
    ("Django REST",     GREEN,     Inches(10.1)),
]):
    rect(sl, x, Inches(1.0), Inches(3.0), Inches(0.6), clr)
    txt(sl, lbl, x, Inches(1.04), Inches(3.0), Inches(0.52),
        size=13, bold=True, clr=WHITE, align=PP_ALIGN.CENTER)
    if i < 3:
        txt(sl, "->", Inches(3.32 + i*3.3), Inches(1.1), Inches(0.4), Inches(0.42),
            size=20, bold=True, clr=ACCENT, align=PP_ALIGN.CENTER)

# All 11 screenshots in a 4-column strip
shot_names = [
    "01_login.png", "02_register.png", "03_dashboard.png",
    "04_quiz_taking.png", "05_quiz_result.png", "06_student_attempts.png",
    "07_attempt_detail.png", "08_admin_quizzes.png", "09_create_quiz.png",
    "10_add_question.png", "11_quiz_results.png",
]
labels = [
    "/login", "/register", "/dashboard",
    "/quiz/[id]", "/quiz/result/[id]", "/student/attempts",
    "/student/attempts/[id]", "/admin/quizzes", "/admin/quizzes/create",
    "/admin/.../add-question", "/admin/.../results",
]
per_row = 6
tw = Inches(2.1)
th = Inches(1.3)
gx2 = Inches(0.12)
gy2 = Inches(0.35)
start_x = Inches(0.25)
start_y = Inches(1.8)

for idx, (name, label) in enumerate(zip(shot_names, labels)):
    col = idx % per_row
    row = idx // per_row
    x = start_x + col * (tw + gx2)
    y = start_y + row * (th + gy2 + Inches(0.22))
    p = os.path.join(IMGS, name)
    shadow_frame(sl, x, y, tw, th)
    img(sl, p, x, y, tw, th)
    txt(sl, label, x, y + th + Inches(0.02), tw, Inches(0.22),
        size=9, clr=BLUE_LIGHT, align=PP_ALIGN.CENTER)

# Key decisions (bottom strip)
rect(sl, Inches(0.25), Inches(6.35), Inches(12.85), Inches(0.72), RGBColor(0x12,0x24,0x5A))
decisions = "Catch-all Proxy · Silent Token Refresh · useParams() · selected_choice_ids[] · toLowercase للأدوار · Trailing Slash استثناءات"
txt(sl, decisions, Inches(0.4), Inches(6.4), Inches(12.6), Inches(0.65),
    size=12, clr=BLUE_LIGHT, align=PP_ALIGN.CENTER)

footer(sl, 8)


# ── Save ──────────────────────────────────────────────────────────────────────
OUT = r"c:\SVU\S25\gProject_Mhd\front_project\Frontend_Presentation.pptx"
prs.save(OUT)
print(f"Saved: {OUT}")
sz = os.path.getsize(OUT)
print(f"Size : {sz:,} bytes  ({sz//1024} KB)")
