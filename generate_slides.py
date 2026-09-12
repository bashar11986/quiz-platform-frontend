from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
from pptx.oxml.ns import qn
from lxml import etree
import copy

# ── Color palette ─────────────────────────────────────────────────────────────
BLUE_DARK   = RGBColor(0x1E, 0x3A, 0x8A)   # navy
BLUE_MID    = RGBColor(0x25, 0x63, 0xEB)   # brand blue
BLUE_LIGHT  = RGBColor(0xDB, 0xEA, 0xFE)   # very light blue
ACCENT      = RGBColor(0x06, 0xB6, 0xD4)   # cyan accent
GREEN       = RGBColor(0x05, 0x96, 0x69)   # emerald
GRAY_DARK   = RGBColor(0x1F, 0x29, 0x37)   # almost black
GRAY_MID    = RGBColor(0x4B, 0x55, 0x63)   # body text
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
ORANGE      = RGBColor(0xF5, 0x9E, 0x0B)   # amber

SLIDE_W = Inches(13.33)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H

blank_layout = prs.slide_layouts[6]   # completely blank


# ── Helper: solid-fill rectangle ─────────────────────────────────────────────
def add_rect(slide, l, t, w, h, fill_color, radius=None):
    shape = slide.shapes.add_shape(1, l, t, w, h)   # MSO_SHAPE_TYPE.RECTANGLE
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()
    return shape


# ── Helper: text box with RTL support ────────────────────────────────────────
def add_text(slide, text, l, t, w, h,
             font_size=18, bold=False, color=GRAY_DARK,
             align=PP_ALIGN.RIGHT, wrap=True, italic=False):
    txBox = slide.shapes.add_textbox(l, t, w, h)
    tf    = txBox.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size  = Pt(font_size)
    run.font.bold  = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run.font.name  = "Arial"
    # RTL paragraph
    pPr = p._p.get_or_add_pPr()
    pPr.set(qn("a:rtl"), "1")
    return txBox


# ── Helper: bullet list ───────────────────────────────────────────────────────
def add_bullets(slide, items, l, t, w, h,
                font_size=16, color=GRAY_MID, bullet_color=BLUE_MID,
                line_spacing=1.25):
    txBox = slide.shapes.add_textbox(l, t, w, h)
    tf    = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.RIGHT
        # bullet symbol
        r_bullet = p.add_run()
        r_bullet.text = "◆  "
        r_bullet.font.size  = Pt(font_size - 2)
        r_bullet.font.color.rgb = bullet_color
        r_bullet.font.name  = "Arial"
        # text
        r_text = p.add_run()
        r_text.text = item
        r_text.font.size  = Pt(font_size)
        r_text.font.color.rgb = color
        r_text.font.name  = "Arial"
        # RTL + spacing
        pPr = p._p.get_or_add_pPr()
        pPr.set(qn("a:rtl"), "1")
        lnSpc = etree.SubElement(pPr, qn("a:lnSpc"))
        spcPct = etree.SubElement(lnSpc, qn("a:spcPct"))
        spcPct.set("val", str(int(line_spacing * 100000)))
    return txBox


# ── Helper: section tag (colored pill) ────────────────────────────────────────
def add_tag(slide, text, l, t, color=BLUE_MID):
    w, h = Inches(2.6), Inches(0.35)
    add_rect(slide, l, t, w, h, color)
    add_text(slide, text, l, t, w, h,
             font_size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — Title
# ══════════════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)

# Full dark background
add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, BLUE_DARK)

# Decorative accent bar (right side)
add_rect(slide, SLIDE_W - Inches(0.18), 0, Inches(0.18), SLIDE_H, ACCENT)

# Top accent line
add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT)

# Logo placeholder circle
add_rect(slide, Inches(5.9), Inches(0.7), Inches(1.5), Inches(1.5), BLUE_MID)
add_text(slide, "🎓", Inches(5.9), Inches(0.72), Inches(1.5), Inches(1.5),
         font_size=36, align=PP_ALIGN.CENTER, color=WHITE)

# Main title
add_text(slide, "منصة الاختبارات الإلكترونية",
         Inches(1), Inches(2.3), Inches(11.3), Inches(0.95),
         font_size=42, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# Sub-title
add_text(slide, "واجهة المستخدم الأمامية — Frontend",
         Inches(1), Inches(3.25), Inches(11.3), Inches(0.6),
         font_size=26, color=ACCENT, align=PP_ALIGN.CENTER, italic=True)

# Divider
add_rect(slide, Inches(3.5), Inches(4.0), Inches(6.3), Inches(0.04), ACCENT)

# Tech line
add_text(slide, "Next.js 16  ·  React 19  ·  TypeScript  ·  Tailwind CSS v4",
         Inches(1), Inches(4.2), Inches(11.3), Inches(0.45),
         font_size=16, color=BLUE_LIGHT, align=PP_ALIGN.CENTER)

# Team / year
add_text(slide, "2025  —  مشروع تخرج",
         Inches(1), Inches(5.0), Inches(11.3), Inches(0.4),
         font_size=14, color=BLUE_LIGHT, align=PP_ALIGN.CENTER)

# Footer bar
add_rect(slide, 0, SLIDE_H - Inches(0.5), SLIDE_W, Inches(0.5), RGBColor(0x0F, 0x1F, 0x4A))
add_text(slide, "Frontend — Slide 1 / 8",
         Inches(0.3), SLIDE_H - Inches(0.48), Inches(5), Inches(0.45),
         font_size=11, color=BLUE_LIGHT, align=PP_ALIGN.LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — Overview & Goals
# ══════════════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_rect(slide, 0, 0, SLIDE_W, Inches(1.5), BLUE_DARK)
add_rect(slide, SLIDE_W - Inches(0.12), 0, Inches(0.12), SLIDE_H, ACCENT)

add_text(slide, "نظرة عامة على الجزء الأمامي",
         Inches(0.5), Inches(0.3), Inches(12), Inches(0.8),
         font_size=30, bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

add_text(slide, "ما الذي تم بناؤه؟",
         Inches(0.5), Inches(1.7), Inches(12), Inches(0.5),
         font_size=20, bold=True, color=BLUE_DARK, align=PP_ALIGN.RIGHT)

add_text(slide,
         "تم تطوير واجهة مستخدم أمامية متكاملة لمنصة اختبارات إلكترونية تربط "
         "بين الطلاب والمحاضرين/الإداريين، تتصل بخادم Django REST عبر نظام "
         "بروكسي داخلي يتجنب مشكلات CORS.",
         Inches(0.5), Inches(2.2), Inches(12.5), Inches(0.85),
         font_size=15, color=GRAY_MID, align=PP_ALIGN.RIGHT)

# Three goal boxes
box_data = [
    (BLUE_MID,  "للطالب",        "تسجيل الدخول، أداء الاختبارات،\nعرض النتائج، مراجعة المحاولات"),
    (GREEN,     "للمحاضر / الأدمن", "إنشاء الاختبارات، إضافة الأسئلة،\nنشر الاختبار، عرض نتائج الطلاب"),
    (ORANGE,    "تقني",          "App Router، JWT، Proxy API،\nمصادقة تلقائية بالـ Refresh Token"),
]
for i, (clr, title, body) in enumerate(box_data):
    x = Inches(0.4 + i * 4.3)
    add_rect(slide, x, Inches(3.2), Inches(4.1), Inches(3.4), clr)
    add_text(slide, title, x, Inches(3.25), Inches(4.1), Inches(0.55),
             font_size=17, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_rect(slide, x + Inches(0.12), Inches(3.85), Inches(3.86), Inches(2.6),
             WHITE)
    add_text(slide, body, x + Inches(0.15), Inches(3.9), Inches(3.8), Inches(2.5),
             font_size=14, color=GRAY_DARK, align=PP_ALIGN.RIGHT)

add_rect(slide, 0, SLIDE_H - Inches(0.45), SLIDE_W, Inches(0.45), BLUE_DARK)
add_text(slide, "Frontend — Slide 2 / 8",
         Inches(0.3), SLIDE_H - Inches(0.43), Inches(5), Inches(0.4),
         font_size=11, color=WHITE, align=PP_ALIGN.LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — Tech Stack
# ══════════════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, RGBColor(0xF8, 0xFA, 0xFF))
add_rect(slide, 0, 0, Inches(0.12), SLIDE_H, BLUE_MID)
add_rect(slide, 0, 0, SLIDE_W, Inches(1.5), BLUE_DARK)
add_rect(slide, 0, 0, Inches(0.12), SLIDE_H, ACCENT)

add_text(slide, "التقنيات والأدوات المستخدمة",
         Inches(0.5), Inches(0.3), Inches(12), Inches(0.8),
         font_size=30, bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

tech_cards = [
    (BLUE_MID,  "Next.js 16.2.9",       "App Router, Turbopack\nAPI Routes, Middleware\nFile-based Routing"),
    (GREEN,     "React 19.2.4",          "Hooks: useState, useEffect\nuseParams, useRouter\nClient Components"),
    (ACCENT,    "TypeScript",            "Type-safe interfaces\nStatic typing\nGenerics & Enums"),
    (ORANGE,    "Tailwind CSS v4",       "Utility-first styling\nResponsive Grid\nRTL & Arabic support"),
    (RGBColor(0x7C,0x3A,0xED), "Authentication", "JWT Tokens\nAccess + Refresh\nlocalStorage + Cookie"),
    (RGBColor(0xE1, 0x1D, 0x48), "API Proxy",    "Catch-all Route\nCORS bypass\nBackend: Django REST"),
]

cols, rows = 3, 2
card_w, card_h = Inches(4.0), Inches(2.2)
start_x, start_y = Inches(0.35), Inches(1.65)
gap_x, gap_y = Inches(0.22), Inches(0.22)

for idx, (clr, title, body) in enumerate(tech_cards):
    row, col = divmod(idx, cols)
    x = start_x + col * (card_w + gap_x)
    y = start_y + row * (card_h + gap_y)
    add_rect(slide, x, y, card_w, Inches(0.52), clr)
    add_text(slide, title, x, y + Inches(0.02), card_w, Inches(0.5),
             font_size=15, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_rect(slide, x, y + Inches(0.52), card_w, card_h - Inches(0.52), WHITE)
    add_text(slide, body, x + Inches(0.1), y + Inches(0.58),
             card_w - Inches(0.2), card_h - Inches(0.65),
             font_size=13, color=GRAY_DARK, align=PP_ALIGN.RIGHT)

add_rect(slide, 0, SLIDE_H - Inches(0.45), SLIDE_W, Inches(0.45), BLUE_DARK)
add_text(slide, "Frontend — Slide 3 / 8",
         Inches(0.3), SLIDE_H - Inches(0.43), Inches(5), Inches(0.4),
         font_size=11, color=WHITE, align=PP_ALIGN.LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — Authentication (Login + Register)
# ══════════════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_rect(slide, 0, 0, SLIDE_W, Inches(1.5), BLUE_DARK)
add_rect(slide, 0, 0, Inches(0.12), SLIDE_H, ACCENT)

add_text(slide, "المصادقة وإدارة الجلسة",
         Inches(0.5), Inches(0.3), Inches(12), Inches(0.8),
         font_size=30, bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

# Login column
add_rect(slide, Inches(6.9), Inches(1.6), Inches(6.2), Inches(5.4), BLUE_LIGHT)
add_text(slide, "صفحة تسجيل الدخول  /login",
         Inches(7.0), Inches(1.65), Inches(6.0), Inches(0.5),
         font_size=17, bold=True, color=BLUE_DARK, align=PP_ALIGN.RIGHT)
add_bullets(slide, [
    "حقل اسم المستخدم وكلمة المرور",
    "زر إظهار/إخفاء كلمة المرور",
    "POST /api/auth/login/  ← Django JWT",
    "تخزين: access_token, refresh_token, userRole",
    "Cookie: accessToken للـ Middleware",
    "رسائل Toast للنجاح والخطأ",
    "رابط للتسجيل → /register",
], Inches(7.0), Inches(2.2), Inches(6.0), Inches(4.5),
   font_size=13, color=GRAY_DARK)

# Register column
add_rect(slide, Inches(0.3), Inches(1.6), Inches(6.3), Inches(5.4),
         RGBColor(0xEC, 0xFF, 0xF5))
add_text(slide, "صفحة إنشاء حساب  /register",
         Inches(0.4), Inches(1.65), Inches(6.1), Inches(0.5),
         font_size=17, bold=True, color=GREEN, align=PP_ALIGN.RIGHT)
add_bullets(slide, [
    "حقول: الاسم الأول، الأخير، اسم المستخدم",
    "البريد الإلكتروني، التخصص، كلمة المرور",
    "POST /api/auth/register/",
    "التحقق من كلمة المرور قبل الإرسال",
    "توجيه تلقائي للـ Dashboard بعد النجاح",
    "زر العودة لتسجيل الدخول",
], Inches(0.4), Inches(2.2), Inches(6.1), Inches(4.5),
   font_size=13, color=GRAY_DARK, bullet_color=GREEN)

# Refresh token flow box
add_rect(slide, Inches(0.3), Inches(5.4), Inches(12.9), Inches(1.55),
         RGBColor(0xFF, 0xF7, 0xE6))
add_text(slide, "آلية التجديد التلقائي للجلسة — Silent Token Refresh",
         Inches(0.4), Inches(5.43), Inches(12.7), Inches(0.4),
         font_size=14, bold=True, color=ORANGE, align=PP_ALIGN.RIGHT)
add_text(slide,
         "عند انتهاء صلاحية Access Token (401) → إرسال Refresh Token تلقائياً → "
         "الحصول على Access Token جديد → إعادة الطلب الأصلي، وإن فشل: مسح الجلسة والتوجيه لـ /login",
         Inches(0.4), Inches(5.85), Inches(12.7), Inches(0.9),
         font_size=13, color=GRAY_DARK, align=PP_ALIGN.RIGHT)

add_rect(slide, 0, SLIDE_H - Inches(0.45), SLIDE_W, Inches(0.45), BLUE_DARK)
add_text(slide, "Frontend — Slide 4 / 8",
         Inches(0.3), SLIDE_H - Inches(0.43), Inches(5), Inches(0.4),
         font_size=11, color=WHITE, align=PP_ALIGN.LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — Dashboard + Quiz Flow
# ══════════════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, RGBColor(0xF8, 0xFA, 0xFF))
add_rect(slide, 0, 0, SLIDE_W, Inches(1.5), BLUE_DARK)
add_rect(slide, 0, 0, Inches(0.12), SLIDE_H, ACCENT)

add_text(slide, "لوحة التحكم الرئيسية وتجربة الاختبار",
         Inches(0.5), Inches(0.3), Inches(12), Inches(0.8),
         font_size=30, bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

# Arrow flow
for i, (lbl, clr) in enumerate([
    ("لوحة التحكم\n/dashboard", BLUE_MID),
    ("بدء الاختبار\n/quiz/[id]",  GREEN),
    ("النتيجة\n/quiz/result/[id]", ORANGE),
]):
    x = Inches(0.3 + i * 4.35)
    add_rect(slide, x, Inches(1.6), Inches(4.0), Inches(1.2), clr)
    add_text(slide, lbl, x, Inches(1.65), Inches(4.0), Inches(1.15),
             font_size=15, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    if i < 2:
        add_text(slide, "→", Inches(4.3 + i * 4.35), Inches(1.8), Inches(0.5), Inches(0.7),
                 font_size=28, bold=True, color=BLUE_MID, align=PP_ALIGN.CENTER)

# Dashboard details
add_rect(slide, Inches(6.8), Inches(2.95), Inches(6.3), Inches(4.1), BLUE_LIGHT)
add_text(slide, "لوحة التحكم — Dashboard",
         Inches(6.9), Inches(3.0), Inches(6.1), Inches(0.5),
         font_size=16, bold=True, color=BLUE_DARK, align=PP_ALIGN.RIGHT)
add_bullets(slide, [
    "عرض جميع الاختبارات المتاحة في بطاقات",
    "بيانات كل اختبار: العنوان، التصنيف، الوقت",
    "عدد الأسئلة، المحاولات المسموح بها",
    "زر \"إضافة اختبار\" للأدمن/المحاضر فقط",
    "زر \"سجل محاولاتي\" لعرض تاريخ الطالب",
    "زر تسجيل الخروج مع مسح الجلسة",
], Inches(6.9), Inches(3.55), Inches(6.1), Inches(3.4), font_size=13)

# Quiz flow details
add_rect(slide, Inches(0.3), Inches(2.95), Inches(6.2), Inches(4.1),
         RGBColor(0xEC, 0xFF, 0xF5))
add_text(slide, "واجهة الاختبار وصفحة النتيجة",
         Inches(0.4), Inches(3.0), Inches(6.0), Inches(0.5),
         font_size=16, bold=True, color=GREEN, align=PP_ALIGN.RIGHT)
add_bullets(slide, [
    "بدء المحاولة: POST /api/quizzes/{id}/start/",
    "عرض الأسئلة بشكل تسلسلي مع عداد الوقت",
    "أسئلة MCQ وإجابات قصيرة short_answer",
    "حفظ attempt_id في localStorage",
    "صفحة النتيجة: النسبة المئوية من الإجابات",
    "حساب: (correct / total) × 100",
    "عرض حالة النجاح/الرسوب (حد 50%)",
], Inches(0.4), Inches(3.55), Inches(6.0), Inches(3.4),
   font_size=13, bullet_color=GREEN, color=GRAY_DARK)

add_rect(slide, 0, SLIDE_H - Inches(0.45), SLIDE_W, Inches(0.45), BLUE_DARK)
add_text(slide, "Frontend — Slide 5 / 8",
         Inches(0.3), SLIDE_H - Inches(0.43), Inches(5), Inches(0.4),
         font_size=11, color=WHITE, align=PP_ALIGN.LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — Student Attempts
# ══════════════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_rect(slide, 0, 0, SLIDE_W, Inches(1.5), BLUE_DARK)
add_rect(slide, 0, 0, Inches(0.12), SLIDE_H, ACCENT)

add_text(slide, "سجل محاولات الطالب ومراجعة الأسئلة",
         Inches(0.5), Inches(0.3), Inches(12), Inches(0.8),
         font_size=30, bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

# Stats cards row
for i, (num, lbl, clr) in enumerate([
    ("∑",  "إجمالي المحاولات", BLUE_MID),
    ("✓",  "المكتملة",         GREEN),
    ("⌀",  "متوسط النسبة",     ORANGE),
    ("↑",  "أعلى نسبة",        RGBColor(0x7C,0x3A,0xED)),
]):
    x = Inches(0.3 + i * 3.25)
    add_rect(slide, x, Inches(1.6), Inches(3.0), Inches(1.1), clr)
    add_text(slide, num, x, Inches(1.62), Inches(1.0), Inches(1.05),
             font_size=26, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, lbl, x + Inches(1.0), Inches(1.75), Inches(2.0), Inches(0.7),
             font_size=13, color=WHITE, align=PP_ALIGN.RIGHT)

# Two columns
add_rect(slide, Inches(6.8), Inches(2.85), Inches(6.3), Inches(4.1), BLUE_LIGHT)
add_text(slide, "صفحة السجل  /student/attempts",
         Inches(6.9), Inches(2.9), Inches(6.1), Inches(0.5),
         font_size=16, bold=True, color=BLUE_DARK, align=PP_ALIGN.RIGHT)
add_bullets(slide, [
    "GET /api/student/attempts/",
    "4 بطاقات إحصائية في الأعلى",
    "جدول المحاولات: الاختبار، التاريخ، النسبة",
    "شارة الحالة: مكتملة / جارية",
    "زر عرض النتيجة + زر مراجعة الأسئلة",
    "حساب النسبة: (correct / total) × 100",
], Inches(6.9), Inches(3.45), Inches(6.1), Inches(3.4), font_size=13)

add_rect(slide, Inches(0.3), Inches(2.85), Inches(6.2), Inches(4.1),
         RGBColor(0xEF, 0xF0, 0xFF))
add_text(slide, "صفحة مراجعة المحاولة  /student/attempts/[id]",
         Inches(0.4), Inches(2.9), Inches(6.0), Inches(0.5),
         font_size=16, bold=True, color=RGBColor(0x7C,0x3A,0xED), align=PP_ALIGN.RIGHT)
add_bullets(slide, [
    "GET /api/student/attempts/{id}  (بدون trailing slash)",
    "عرض كل سؤال مع خياراته",
    "تمييز الإجابة الصحيحة (أخضر)",
    "تمييز الإجابة الخاطئة التي اختارها (أحمر)",
    "استخدام selected_choice_ids[] لتحديد الاختيار",
    "اشتقاق حالة الإجابة من is_correct + answered_at",
    "عرض النقاط + النسبة في الأعلى",
], Inches(0.4), Inches(3.45), Inches(6.0), Inches(3.4),
   font_size=13, bullet_color=RGBColor(0x7C,0x3A,0xED), color=GRAY_DARK)

add_rect(slide, 0, SLIDE_H - Inches(0.45), SLIDE_W, Inches(0.45), BLUE_DARK)
add_text(slide, "Frontend — Slide 6 / 8",
         Inches(0.3), SLIDE_H - Inches(0.43), Inches(5), Inches(0.4),
         font_size=11, color=WHITE, align=PP_ALIGN.LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — Admin / Instructor Panel
# ══════════════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, RGBColor(0xF8, 0xFA, 0xFF))
add_rect(slide, 0, 0, SLIDE_W, Inches(1.5), BLUE_DARK)
add_rect(slide, 0, 0, Inches(0.12), SLIDE_H, GREEN)

add_text(slide, "لوحة تحكم المحاضر والإداري",
         Inches(0.5), Inches(0.3), Inches(12), Inches(0.8),
         font_size=30, bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

panels = [
    (GREEN,   "إدارة الاختبارات\n/admin/quizzes",
     ["GET /api/quizzes/ — عرض كل الاختبارات",
      "جدول: العنوان، التصنيف، عدد الأسئلة، النقاط",
      "PATCH لتبديل حالة النشر is_published",
      "روابط: + سؤال، النتائج لكل اختبار"]),
    (BLUE_MID, "إنشاء اختبار جديد\n/admin/quizzes/create",
     ["POST /api/quizzes/",
      "حقول: العنوان، الوصف، التصنيف",
      "مدة الزمن، عدد المحاولات المسموحة",
      "توجيه لصفحة إضافة الأسئلة بعد الإنشاء"]),
    (ORANGE,  "إضافة أسئلة\n/admin/quizzes/[id]/add-question",
     ["POST /api/questions/",
      "نوع السؤال: MCQ / إجابة قصيرة",
      "إضافة 4 خيارات وتحديد الصحيح",
      "تحديد النقاط لكل سؤال"]),
    (RGBColor(0x7C,0x3A,0xED), "نتائج الاختبار\n/admin/quizzes/[id]/results",
     ["GET /api/instructor/quizzes/{id}/results/",
      "إحصاءات: المتوسط، الأعلى، الأدنى",
      "نسبة النجاح، عدد الناجحين/الراسبين",
      "جدول كل الطلاب مع بحث فوري"]),
]

for idx, (clr, title, bullets) in enumerate(panels):
    col, row = divmod(idx, 2)
    x = Inches(0.3 + col * 6.55)
    y = Inches(1.6 + row * 2.85)
    add_rect(slide, x, y, Inches(6.3), Inches(0.65), clr)
    add_text(slide, title, x, y + Inches(0.05), Inches(6.3), Inches(0.6),
             font_size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_rect(slide, x, y + Inches(0.65), Inches(6.3), Inches(2.05), WHITE)
    add_bullets(slide, bullets, x + Inches(0.1), y + Inches(0.72),
                Inches(6.1), Inches(1.9), font_size=12,
                bullet_color=clr, color=GRAY_DARK)

add_rect(slide, 0, SLIDE_H - Inches(0.45), SLIDE_W, Inches(0.45), BLUE_DARK)
add_text(slide, "Frontend — Slide 7 / 8",
         Inches(0.3), SLIDE_H - Inches(0.43), Inches(5), Inches(0.4),
         font_size=11, color=WHITE, align=PP_ALIGN.LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 8 — Architecture & Summary
# ══════════════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, BLUE_DARK)
add_rect(slide, 0, 0, Inches(0.12), SLIDE_H, ACCENT)
add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT)

add_text(slide, "البنية التقنية والملخص",
         Inches(0.5), Inches(0.2), Inches(12.5), Inches(0.75),
         font_size=28, bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

# Architecture diagram (simplified boxes)
layers = [
    ("المستخدم / المتصفح", ACCENT,    Inches(0.3),  Inches(1.1), Inches(3.0)),
    ("Next.js Pages",       BLUE_MID,  Inches(3.6),  Inches(1.1), Inches(3.0)),
    ("API Proxy Routes",    ORANGE,    Inches(6.9),  Inches(1.1), Inches(3.0)),
    ("Django REST Backend", GREEN,     Inches(10.2), Inches(1.1), Inches(2.9)),
]
for lbl, clr, x, y, w in layers:
    add_rect(slide, x, y, w, Inches(0.65), clr)
    add_text(slide, lbl, x, y + Inches(0.05), w, Inches(0.55),
             font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# Arrows between layers
for ax in [Inches(3.3), Inches(6.6), Inches(9.9)]:
    add_text(slide, "→", ax, Inches(1.12), Inches(0.45), Inches(0.55),
             font_size=22, bold=True, color=ACCENT, align=PP_ALIGN.CENTER)

# Key decisions
add_rect(slide, Inches(0.3), Inches(1.9), Inches(6.1), Inches(4.95),
         RGBColor(0x1A, 0x2F, 0x6A))
add_text(slide, "قرارات معمارية رئيسية",
         Inches(0.4), Inches(1.95), Inches(5.9), Inches(0.5),
         font_size=16, bold=True, color=ACCENT, align=PP_ALIGN.RIGHT)
add_bullets(slide, [
    "Catch-all Proxy لتجاوز CORS مع Django",
    "Trailing Slash موحّدة إلا لـ /student/attempts/{id}",
    "Refresh Token تلقائي عند كل 401",
    "حساب النسبة client-side لا من الـ score الخام",
    "userRole بحروف صغيرة دائماً (toLowerCase)",
    "Middleware مبسّط: NextResponse.next() فقط",
    "useParams() hook لـ dynamic segments (Next.js 16)",
    "selected_choice_ids[] بدل selected_choice (null دائماً)",
], Inches(0.4), Inches(2.55), Inches(5.9), Inches(4.1),
   font_size=12, color=RGBColor(0xCB, 0xD5, 0xE1), bullet_color=ACCENT)

# Pages list
add_rect(slide, Inches(6.7), Inches(1.9), Inches(6.4), Inches(4.95),
         RGBColor(0x1A, 0x2F, 0x6A))
add_text(slide, "الصفحات المُنجزة — 11 صفحة",
         Inches(6.8), Inches(1.95), Inches(6.2), Inches(0.5),
         font_size=16, bold=True, color=GREEN, align=PP_ALIGN.RIGHT)
add_bullets(slide, [
    "/login  — تسجيل الدخول",
    "/register  — إنشاء حساب جديد",
    "/dashboard  — لوحة التحكم الرئيسية",
    "/quiz/[id]  — أداء الاختبار",
    "/quiz/result/[id]  — نتيجة الاختبار",
    "/student/attempts  — سجل المحاولات",
    "/student/attempts/[id]  — مراجعة محاولة",
    "/admin/quizzes  — إدارة الاختبارات",
    "/admin/quizzes/create  — إنشاء اختبار",
    "/admin/quizzes/[id]/add-question  — إضافة سؤال",
    "/admin/quizzes/[id]/results  — نتائج الاختبار",
], Inches(6.8), Inches(2.55), Inches(6.2), Inches(4.1),
   font_size=12, color=RGBColor(0xCB, 0xD5, 0xE1), bullet_color=GREEN)

add_rect(slide, 0, SLIDE_H - Inches(0.45), SLIDE_W, Inches(0.45),
         RGBColor(0x0A, 0x15, 0x35))
add_text(slide, "Frontend — Slide 8 / 8",
         Inches(0.3), SLIDE_H - Inches(0.43), Inches(5), Inches(0.4),
         font_size=11, color=BLUE_LIGHT, align=PP_ALIGN.LEFT)
add_text(slide, "منصة الاختبارات الإلكترونية — الجزء الأمامي",
         Inches(5), SLIDE_H - Inches(0.43), Inches(8.0), Inches(0.4),
         font_size=11, color=BLUE_LIGHT, align=PP_ALIGN.RIGHT)


# ── Save ──────────────────────────────────────────────────────────────────────
out = r"c:\SVU\S25\gProject_Mhd\front_project\Frontend_Presentation.pptx"
prs.save(out)
print(f"Saved: {out}")
