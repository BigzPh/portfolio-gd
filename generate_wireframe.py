#!/usr/bin/env python3
"""
CEEL 301 | Graphics Design - Lesson 9 Activity 7
Portfolio Low-Fidelity Wireframe & Navigation Flow Generator
Student: John Carlo Cacao | Section: BSCS 3CS4
Dimensions: 8.5 x 13 inches (Standard Long Bond Paper / Folio: 612 x 936 pt)
"""

import os
from reportlab.lib.pagesizes import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import fitz  # PyMuPDF for rendering preview images

PAGE_WIDTH = 8.5 * inch   # 612 pt
PAGE_HEIGHT = 13.0 * inch # 936 pt

# Palette for Low-Fidelity Architectural Wireframe
CLR_BG = colors.HexColor('#F8F9FA')
CLR_WHITE = colors.HexColor('#FFFFFF')
CLR_BORDER = colors.HexColor('#2B2D42')
CLR_WIRE_LINE = colors.HexColor('#4A4E69')
CLR_ACCENT = colors.HexColor('#22577A')
CLR_MUTED = colors.HexColor('#8D99AE')
CLR_LIGHT_GRAY = colors.HexColor('#EDF2F4')
CLR_SHADOW = colors.HexColor('#D3D3D3')
CLR_NOTE_BG = colors.HexColor('#EBF4F6')
CLR_NOTE_BORDER = colors.HexColor('#028090')

def draw_header_block(c, page_num, total_pages, page_title, page_subtitle):
    """Draws university academic header and activity info banner."""
    # Top banner background
    c.setFillColor(CLR_WHITE)
    c.rect(30, 850, 552, 60, fill=1, stroke=1)
    
    # Institution & Activity Title
    c.setFillColor(CLR_ACCENT)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(42, 894, "CITY COLLEGE OF CALAMBA")
    c.setFont("Helvetica", 8)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(190, 894, "·  Department of Computer Studies  ·  BS Computer Science")
    
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(42, 878, "CEEL 301: Graphics Design  —  Lesson 9 Activity 7: Portfolio Wireframe & User Flow")
    
    c.setFont("Helvetica", 8)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(42, 862, "Student: John Carlo Cacao   |   Section: BSCS 3CS4   |   Date: September 29, 2026   |   Size: 8.5 × 13\" (Long Bond Paper)")
    
    # Page indicator badge
    c.setFillColor(CLR_LIGHT_GRAY)
    c.roundRect(515, 860, 55, 38, 4, fill=1, stroke=1)
    c.setFillColor(CLR_ACCENT)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(542, 882, f"PAGE {page_num}")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawCentredString(542, 868, f"of {total_pages}")
    
    # Subtitle bar
    c.setFillColor(CLR_ACCENT)
    c.rect(30, 822, 552, 22, fill=1, stroke=0)
    c.setFillColor(CLR_WHITE)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(40, 828, page_title.upper())
    c.setFont("Helvetica-Oblique", 7.5)
    c.drawRightString(572, 828, page_subtitle)

def draw_placeholder_box(c, x, y, w, h, label=""):
    """Draws standard UX wireframe placeholder box with diagonal X."""
    c.setStrokeColor(CLR_MUTED)
    c.setFillColor(CLR_LIGHT_GRAY)
    c.rect(x, y, w, h, fill=1, stroke=1)
    
    # Diagonal lines
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.setLineWidth(0.8)
    c.line(x, y, x + w, y + h)
    c.line(x, y + h, x + w, y)
    
    if label:
        c.setFillColor(CLR_BORDER)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(x + w / 2, y + h / 2 - 2.5, label)
    c.setStrokeColor(CLR_BORDER)
    c.setLineWidth(1)

def draw_pill(c, x, y, w, h, text, fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=6.5):
    """Draws a rounded tag or pill badge."""
    c.setFillColor(fill_color)
    c.setStrokeColor(CLR_MUTED)
    c.setLineWidth(0.6)
    c.roundRect(x, y, w, h, h/2, fill=1, stroke=1)
    c.setFillColor(text_color)
    c.setFont("Helvetica", font_size)
    c.drawCentredString(x + w/2, y + h/2 - 2, text)
    c.setStrokeColor(CLR_BORDER)
    c.setLineWidth(1)

def draw_annotation_callout(c, x, y, w, h, tag_num, title, body_text, target_x=None, target_y=None):
    """Draws an annotated sticky callout box with a dashed pointer line to target."""
    c.setStrokeColor(CLR_NOTE_BORDER)
    c.setFillColor(CLR_NOTE_BG)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 4, fill=1, stroke=1)
    
    # Badge number
    c.setFillColor(CLR_NOTE_BORDER)
    c.circle(x + 12, y + h - 11, 7, fill=1, stroke=0)
    c.setFillColor(CLR_WHITE)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawCentredString(x + 12, y + h - 13.5, str(tag_num))
    
    # Title
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(x + 23, y + h - 13, title)
    
    # Body text wrapped
    c.setFillColor(CLR_WIRE_LINE)
    c.setFont("Helvetica", 6.2)
    lines = body_text.split("\n")
    cur_y = y + h - 23
    for line in lines:
        c.drawString(x + 8, cur_y, line)
        cur_y -= 8.5
        
    # Pointer line to target
    if target_x is not None and target_y is not None:
        c.setStrokeColor(CLR_NOTE_BORDER)
        c.setLineWidth(0.7)
        c.setDash([2, 2])
        # Find closest edge
        start_x = x if target_x < x else (x + w if target_x > x + w else target_x)
        start_y = y + h/2
        c.line(start_x, start_y, target_x, target_y)
        c.circle(target_x, target_y, 2, fill=1, stroke=0)
        c.setDash([])
        c.setStrokeColor(CLR_BORDER)
        c.setLineWidth(1)

def build_page_1(c):
    """PAGE 1: Complete Portfolio Main Page Architecture & Section Wireframes"""
    draw_header_block(c, 1, 2, "PORTFOLIO MAIN PAGE WIREFRAME & COMPONENT ARCHITECTURE", "Low-Fidelity Architecture, Annotations & Layout Hierarchy")
    
    # Left: Desktop Browser Mockup Wireframe
    frame_x = 30
    frame_y = 45
    frame_w = 385
    frame_h = 765
    
    # Outer frame
    c.setFillColor(CLR_WHITE)
    c.setStrokeColor(CLR_BORDER)
    c.setLineWidth(1.2)
    c.roundRect(frame_x, frame_y, frame_w, frame_h, 6, fill=1, stroke=1)
    
    # Browser Window Bar
    c.setFillColor(CLR_LIGHT_GRAY)
    c.rect(frame_x, frame_y + frame_h - 22, frame_w, 22, fill=1, stroke=1)
    # Window circles
    c.setFillColor(colors.HexColor('#FF5F56'))
    c.circle(frame_x + 10, frame_y + frame_h - 11, 3.5, fill=1, stroke=0)
    c.setFillColor(colors.HexColor('#FFBD2E'))
    c.circle(frame_x + 20, frame_y + frame_h - 11, 3.5, fill=1, stroke=0)
    c.setFillColor(colors.HexColor('#27C93F'))
    c.circle(frame_x + 30, frame_y + frame_h - 11, 3.5, fill=1, stroke=0)
    
    # URL bar
    c.setFillColor(CLR_WHITE)
    c.setStrokeColor(CLR_MUTED)
    c.setLineWidth(0.6)
    c.roundRect(frame_x + 46, frame_y + frame_h - 18, 280, 14, 3, fill=1, stroke=1)
    c.setFillColor(CLR_MUTED)
    c.setFont("Helvetica", 6.5)
    c.drawString(frame_x + 55, frame_y + frame_h - 14, "https://carlo.dev/portfolio-gd  (Responsive Single-Page)")
    
    # Inner viewport content start
    vp_top = frame_y + frame_h - 22
    
    # -------------------------------------------------------------
    # SECTION 1: HEADER & PROFILE HERO BLOCK (Y: 760 -> 665)
    # -------------------------------------------------------------
    sec1_y = vp_top - 88
    c.setFillColor(CLR_BG)
    c.setStrokeColor(CLR_LIGHT_GRAY)
    c.rect(frame_x + 1, sec1_y, frame_w - 2, 88, fill=1, stroke=1)
    
    # Profile photo placeholder with hover cue
    draw_placeholder_box(c, frame_x + 16, sec1_y + 14, 60, 60, "[Profile Avatar]")
    c.setFillColor(CLR_ACCENT)
    c.setFont("Helvetica-Bold", 5.5)
    c.drawCentredString(frame_x + 46, sec1_y + 6, "Hover: Profile-Dark")
    
    # Name & Tagline
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(frame_x + 86, sec1_y + 62, "Hey! I'm Carlo")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(frame_x + 86, sec1_y + 51, "Mobile Developer & Computer Science Student at City College of Calamba")
    
    # Badges
    draw_pill(c, frame_x + 86, sec1_y + 34, 110, 13, "CCC Hackathon 2025 Champion", fill_color=colors.HexColor('#FEF3C7'), text_color=colors.HexColor('#92400E'), font_size=5.5)
    draw_pill(c, frame_x + 200, sec1_y + 34, 95, 13, "DCI Hackathon 2026 Finalist", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=5.5)
    
    # Action Buttons: Resume, GitHub, LinkedIn, Contact
    draw_pill(c, frame_x + 86, sec1_y + 16, 52, 14, "Resume [PDF]", fill_color=CLR_ACCENT, text_color=CLR_WHITE, font_size=6)
    draw_pill(c, frame_x + 142, sec1_y + 16, 42, 14, "GitHub", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=6)
    draw_pill(c, frame_x + 188, sec1_y + 16, 46, 14, "LinkedIn", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=6)
    draw_pill(c, frame_x + 238, sec1_y + 16, 44, 14, "Contact", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=6)
    
    # Theme switch button top right (Square icon button matching website 38x38 ratio)
    theme_btn_x = frame_x + frame_w - 36
    theme_btn_y = sec1_y + 58
    c.setFillColor(CLR_WHITE)
    c.setStrokeColor(CLR_BORDER)
    c.setLineWidth(0.8)
    c.roundRect(theme_btn_x, theme_btn_y, 22, 22, 4, fill=1, stroke=1)
    
    # Sun icon inside button
    c.setFillColor(CLR_ACCENT)
    c.circle(theme_btn_x + 11, theme_btn_y + 11, 4, fill=1, stroke=0)
    c.setStrokeColor(CLR_ACCENT)
    c.setLineWidth(0.8)
    c.line(theme_btn_x + 11, theme_btn_y + 1, theme_btn_x + 11, theme_btn_y + 4)
    c.line(theme_btn_x + 11, theme_btn_y + 18, theme_btn_x + 11, theme_btn_y + 21)
    c.line(theme_btn_x + 1, theme_btn_y + 11, theme_btn_x + 4, theme_btn_y + 11)
    c.line(theme_btn_x + 18, theme_btn_y + 11, theme_btn_x + 21, theme_btn_y + 11)
    c.setStrokeColor(CLR_BORDER)
    c.setLineWidth(1)
    
    # -------------------------------------------------------------
    # SECTION 2: ABOUT ME & PHILOSOPHY (Y: 660 -> 595)
    # -------------------------------------------------------------
    sec2_y = sec1_y - 70
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(frame_x + 16, sec2_y + 54, "ABOUT ME")
    c.setStrokeColor(CLR_ACCENT)
    c.setLineWidth(1)
    c.line(frame_x + 16, sec2_y + 50, frame_x + 45, sec2_y + 50)
    
    # Low-fi text representation (simulated paragraphs)
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.setLineWidth(3)
    c.line(frame_x + 16, sec2_y + 40, frame_x + frame_w - 20, sec2_y + 40)
    c.line(frame_x + 16, sec2_y + 32, frame_x + frame_w - 40, sec2_y + 32)
    c.line(frame_x + 16, sec2_y + 24, frame_x + frame_w - 30, sec2_y + 24)
    c.line(frame_x + 16, sec2_y + 16, frame_x + frame_w - 80, sec2_y + 16)
    
    # -------------------------------------------------------------
    # SECTION 3: TECH & CREATIVE STACK (Y: 590 -> 505)
    # -------------------------------------------------------------
    sec3_y = sec2_y - 88
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(frame_x + 16, sec3_y + 74, "TECH STACK & CREATIVE SKILLS")
    c.setStrokeColor(CLR_ACCENT)
    c.line(frame_x + 16, sec3_y + 70, frame_x + 80, sec3_y + 70)
    
    # Category 1: Mobile Development
    c.setFont("Helvetica-Bold", 6.5)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(frame_x + 16, sec3_y + 56, "MOBILE DEVELOPMENT:")
    draw_pill(c, frame_x + 16, sec3_y + 42, 34, 11, "Kotlin", font_size=5.5)
    draw_pill(c, frame_x + 53, sec3_y + 42, 60, 11, "Compose Multiplatform", font_size=5.5)
    draw_pill(c, frame_x + 116, sec3_y + 42, 42, 11, "Flutter", font_size=5.5)
    draw_pill(c, frame_x + 161, sec3_y + 42, 40, 11, "SwiftUI", font_size=5.5)
    draw_pill(c, frame_x + 204, sec3_y + 42, 44, 11, "WidgetKit", font_size=5.5)
    
    # Category 2: Graphic Design & Creative (CEEL 301 focus)
    c.drawString(frame_x + 16, sec3_y + 28, "GRAPHIC DESIGN & BRANDING (CEEL 301):")
    draw_pill(c, frame_x + 16, sec3_y + 14, 52, 11, "Brand Identity", fill_color=colors.HexColor('#E0F2FE'), text_color=colors.HexColor('#0369A1'), font_size=5.5)
    draw_pill(c, frame_x + 71, sec3_y + 14, 48, 11, "Logo Design", fill_color=colors.HexColor('#E0F2FE'), text_color=colors.HexColor('#0369A1'), font_size=5.5)
    draw_pill(c, frame_x + 122, sec3_y + 14, 58, 11, "Digital Advertising", fill_color=colors.HexColor('#FEF3C7'), text_color=colors.HexColor('#92400E'), font_size=5.5)
    draw_pill(c, frame_x + 183, sec3_y + 14, 46, 11, "Typography", fill_color=colors.HexColor('#FFEDD5'), text_color=colors.HexColor('#C2410C'), font_size=5.5)
    draw_pill(c, frame_x + 232, sec3_y + 14, 42, 11, "Photoshop", font_size=5.5)
    draw_pill(c, frame_x + 277, sec3_y + 14, 34, 11, "Canva", font_size=5.5)
    
    # -------------------------------------------------------------
    # SECTION 4: MOBILE PROJECTS (3 CARDS) (Y: 500 -> 345)
    # -------------------------------------------------------------
    sec4_y = sec3_y - 150
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(frame_x + 16, sec4_y + 138, "PROJECTS (MOBILE APPLICATIONS)")
    c.setStrokeColor(CLR_ACCENT)
    c.line(frame_x + 16, sec4_y + 134, frame_x + 85, sec4_y + 134)
    
    # 3 Cards Grid
    card_w = 114
    card_h = 124
    card_gap = 6
    
    projects = [
        ("Lapi", "Dynamic Island App", "Compose Multiplatform, Swift", "App Store"),
        ("Paddi", "Sticky Notes Widget", "Kotlin Multiplatform, Widgets", "Play / iOS"),
        ("glot", "On-Device Translator", "ML Kit OCR, MediaProjection", "Showcase")
    ]
    
    for i, (p_title, p_cat, p_tech, p_store) in enumerate(projects):
        cx = frame_x + 16 + i * (card_w + card_gap)
        cy = sec4_y
        
        c.setFillColor(CLR_WHITE)
        c.setStrokeColor(CLR_MUTED)
        c.setLineWidth(0.8)
        c.roundRect(cx, cy, card_w, card_h, 4, fill=1, stroke=1)
        
        # Project logo thumbnail
        draw_placeholder_box(c, cx + 8, cy + card_h - 26, 18, 18)
        c.setFillColor(CLR_BORDER)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(cx + 30, cy + card_h - 18, p_title)
        c.setFont("Helvetica", 5.5)
        c.setFillColor(CLR_WIRE_LINE)
        c.drawString(cx + 30, cy + card_h - 25, p_cat)
        
        # Description lines
        c.setStrokeColor(colors.HexColor('#E2E8F0'))
        c.setLineWidth(2)
        c.line(cx + 8, cy + card_h - 38, cx + card_w - 8, cy + card_h - 38)
        c.line(cx + 8, cy + card_h - 44, cx + card_w - 14, cy + card_h - 44)
        c.line(cx + 8, cy + card_h - 50, cx + card_w - 20, cy + card_h - 50)
        
        # Mini tech pills
        draw_pill(c, cx + 8, cy + 34, card_w - 16, 11, p_tech, font_size=5)
        
        # View Showcase Trigger Button
        draw_pill(c, cx + 8, cy + 18, card_w - 16, 13, "View Showcase  →", fill_color=CLR_ACCENT, text_color=CLR_WHITE, font_size=6)
        c.setFont("Helvetica", 5)
        c.setFillColor(CLR_WIRE_LINE)
        c.drawCentredString(cx + card_w/2, cy + 8, f"Links: {p_store}")

    # -------------------------------------------------------------
    # SECTION 5: GRAPHIC DESIGN & BRANDING (3 CARDS) (Y: 340 -> 180)
    # -------------------------------------------------------------
    sec5_y = sec4_y - 154
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(frame_x + 16, sec5_y + 142, "GRAPHIC DESIGN & BRANDING (CEEL 301 DELIVERABLES)")
    c.setStrokeColor(CLR_ACCENT)
    c.line(frame_x + 16, sec5_y + 138, frame_x + 120, sec5_y + 138)
    
    gd_projects = [
        ("BIGZ Mobile Dev", "Brand Identity & Mascot", "Logo System, Guidelines", "bmd_guide.pdf"),
        ("Urban Threads", "Streetwear E-Commerce", "Display Ads, Web Banners", "4 Ad Creatives"),
        ("Common Ground", "Coffee Typography", "Woodtype Sans, Pairing", "A3 Print Poster")
    ]
    
    for i, (g_title, g_cat, g_tech, g_asset) in enumerate(gd_projects):
        cx = frame_x + 16 + i * (card_w + card_gap)
        cy = sec5_y + 8
        
        c.setFillColor(CLR_WHITE)
        c.setStrokeColor(CLR_MUTED)
        c.setLineWidth(0.8)
        c.roundRect(cx, cy, card_w, card_h, 4, fill=1, stroke=1)
        
        # Logo thumbnail box
        draw_placeholder_box(c, cx + 8, cy + card_h - 26, 18, 18, "[Art]")
        c.setFillColor(CLR_BORDER)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(cx + 30, cy + card_h - 17, g_title)
        c.setFont("Helvetica", 5.2)
        c.setFillColor(CLR_WIRE_LINE)
        c.drawString(cx + 30, cy + card_h - 24, g_cat)
        
        # Simulated copy
        c.setStrokeColor(colors.HexColor('#E2E8F0'))
        c.setLineWidth(2)
        c.line(cx + 8, cy + card_h - 38, cx + card_w - 8, cy + card_h - 38)
        c.line(cx + 8, cy + card_h - 44, cx + card_w - 12, cy + card_h - 44)
        c.line(cx + 8, cy + card_h - 50, cx + card_w - 24, cy + card_h - 50)
        
        # Tech tags
        draw_pill(c, cx + 8, cy + 34, card_w - 16, 11, g_tech, fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=5)
        
        # Showcase button
        draw_pill(c, cx + 8, cy + 18, card_w - 16, 13, "View Showcase  →", fill_color=CLR_BORDER, text_color=CLR_WHITE, font_size=6)
        c.setFont("Helvetica", 5)
        c.setFillColor(CLR_WIRE_LINE)
        c.drawCentredString(cx + card_w/2, cy + 8, f"Deliverable: {g_asset}")

    # -------------------------------------------------------------
    # SECTION 6: CONTACT & FOOTER (Y: 175 -> 50)
    # -------------------------------------------------------------
    sec6_y = frame_y + 8
    c.setFillColor(CLR_LIGHT_GRAY)
    c.setStrokeColor(CLR_MUTED)
    c.rect(frame_x + 1, sec6_y, frame_w - 2, 70, fill=1, stroke=0)
    
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(frame_x + 16, sec6_y + 54, "CONTACT & COLLABORATION")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(frame_x + 16, sec6_y + 44, "Open for mobile development internships & design projects.")
    
    # 3 Contact Link Cards
    draw_pill(c, frame_x + 16, sec6_y + 14, 110, 22, "Email: johncarlozcacao@gmail.com", fill_color=CLR_WHITE, font_size=5.5)
    draw_pill(c, frame_x + 132, sec6_y + 14, 105, 22, "GitHub: github.com/BigzPh", fill_color=CLR_WHITE, font_size=5.5)
    draw_pill(c, frame_x + 243, sec6_y + 14, 120, 22, "LinkedIn: in/john-carlo-cacao", fill_color=CLR_WHITE, font_size=5.5)
    
    # -------------------------------------------------------------
    # RIGHT COLUMN: ANNOTATIONS & ARCHITECTURAL SPECS (X: 425 -> 582)
    # -------------------------------------------------------------
    ann_x = 426
    ann_w = 156
    
    c.setFillColor(CLR_ACCENT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(ann_x, 804, "WIREFRAME ANNOTATIONS")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(ann_x, 794, "Design rationale & functional specs")
    
    draw_annotation_callout(c, ann_x, 728, ann_w, 58, 1, "Header & Dual Avatar",
        "• Circular avatar with theme-aware\n  hover state (profile & dark mode).\n• Hackathon champion credentials.\n• Primary CTA: Resume PDF download\n  and social profile anchor links.",
        target_x=frame_x + frame_w, target_y=755)
        
    draw_annotation_callout(c, ann_x, 660, ann_w, 60, 2, "Theme & Accessibility",
        "• Fixed contrast toggle (sun/moon).\n• CSS custom variables for seamless\n  Light / Dark mode adaptation.\n• WCAG AA contrast compliance\n  and keyboard navigation (ESC/Tab).",
        target_x=frame_x + frame_w, target_y=735)

    draw_annotation_callout(c, ann_x, 592, ann_w, 60, 3, "About Narrative",
        "• Concise personal bio & aspirations.\n• Grounded in CCC Computer Science.\n• Responsive text container with\n  calibrated leading for readability\n  across mobile and desktop.",
        target_x=frame_x + frame_w, target_y=625)

    draw_annotation_callout(c, ann_x, 505, ann_w, 78, 4, "Categorized Tech Stack",
        "• Skill pills categorized by domain:\n  Mobile, Frontend & Graphic Design.\n• Prominently highlights CEEL 301\n  skills: Brand Identity, Typography,\n  Advertising Design, and Photoshop.",
        target_x=frame_x + frame_w, target_y=545)

    draw_annotation_callout(c, ann_x, 385, ann_w, 110, 5, "Mobile Projects Grid",
        "• 3-column desktop layout that collapses\n  to single-column on mobile viewports.\n• Standardized card hierarchy:\n  Logo -> Title -> Tagline -> Tech Pills.\n• Primary action: 'View Showcase' button\n  triggering interactive modal overlay.",
        target_x=frame_x + frame_w, target_y=440)

    draw_annotation_callout(c, ann_x, 215, ann_w, 160, 6, "Graphic Design Showcase",
        "• CEEL 301 Specific Projects:\n  1. BIGZ Mobile Dev (Brand Identity)\n  2. Urban Threads (Streetwear Ads)\n  3. Common Ground (Coffee Typography)\n• Directly links to official PDF manuals\n  and multi-channel asset viewers.\n• Unified visual weight with mobile cards.\n• Displays deliverables for Midterm/Prelim.",
        target_x=frame_x + frame_w, target_y=290)

    draw_annotation_callout(c, ann_x, 45, ann_w, 160, 7, "Contact & Conversion",
        "• High-visibility contact cards.\n• Direct mailto and professional\n  profile anchors.\n• Minimal friction for recruiters\n  and instructors to evaluate works.\n• Clean mobile-first spacing ensuring\n  no tap target overlap.",
        target_x=frame_x + frame_w, target_y=125)

def build_page_2(c):
    """PAGE 2: Inner Page / Interactive Modal Showcase Wireframe & Navigation Flow"""
    draw_header_block(c, 2, 2, "INNER PAGE & MODAL WIREFRAME ARCHITECTURE", "Interactive Simulator & Flow")
    
    # -------------------------------------------------------------
    # SECTION 1: USER NAVIGATION FLOWCHART (Y: 810 -> 610)
    # -------------------------------------------------------------
    flow_y = 615
    flow_h = 195
    c.setFillColor(CLR_WHITE)
    c.setStrokeColor(CLR_BORDER)
    c.setLineWidth(1)
    c.roundRect(30, flow_y, 552, flow_h, 6, fill=1, stroke=1)
    
    # Flowchart Section Title
    c.setFillColor(CLR_ACCENT)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(42, flow_y + flow_h - 16, "A. USER NAVIGATION FLOW DIAGRAM (PAGE-TO-MODAL FLOW)")
    c.setFont("Helvetica", 7)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(42, flow_y + flow_h - 26, "Step-by-step navigation map illustrating how users explore projects, trigger modal overlays, and interact with design assets.")
    
    # Flow Step Nodes
    def draw_flow_node(nx, ny, nw, nh, step_num, title, sub):
        c.setFillColor(CLR_LIGHT_GRAY)
        c.setStrokeColor(CLR_BORDER)
        c.setLineWidth(0.8)
        c.roundRect(nx, ny, nw, nh, 4, fill=1, stroke=1)
        # Step tag
        c.setFillColor(CLR_ACCENT)
        c.roundRect(nx + 4, ny + nh - 12, 34, 9, 2, fill=1, stroke=0)
        c.setFillColor(CLR_WHITE)
        c.setFont("Helvetica-Bold", 5.5)
        c.drawCentredString(nx + 21, ny + nh - 9.5, f"STEP {step_num}")
        # Title
        c.setFillColor(CLR_BORDER)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(nx + 42, ny + nh - 10, title)
        # Subtitle
        c.setFillColor(CLR_WIRE_LINE)
        c.setFont("Helvetica", 6)
        c.drawString(nx + 8, ny + 8, sub)

    def draw_flow_arrow(x1, y1, x2, y2, label=""):
        c.setStrokeColor(CLR_ACCENT)
        c.setLineWidth(1)
        c.line(x1, y1, x2, y2)
        # Arrowhead
        p = c.beginPath()
        if x2 > x1: # Horizontal right
            p.moveTo(x2, y2)
            p.lineTo(x2 - 5, y2 + 3)
            p.lineTo(x2 - 5, y2 - 3)
        elif y1 > y2: # Vertical down
            p.moveTo(x2, y2)
            p.lineTo(x2 - 3, y2 + 5)
            p.lineTo(x2 + 3, y2 + 5)
        elif y2 > y1: # Vertical up
            p.moveTo(x2, y2)
            p.lineTo(x2 - 3, y2 - 5)
            p.lineTo(x2 + 3, y2 - 5)
        elif x1 > x2: # Horizontal left
            p.moveTo(x2, y2)
            p.lineTo(x2 + 5, y2 + 3)
            p.lineTo(x2 + 5, y2 - 3)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        if label:
            c.setFillColor(CLR_ACCENT)
            c.setFont("Helvetica-Bold", 5.5)
            c.drawCentredString((x1 + x2)/2, (y1 + y2)/2 + 4, label)

    # 4 Sequential Main Flow Steps
    node_w = 115
    node_h = 36
    node_y1 = flow_y + flow_h - 70
    
    draw_flow_node(42, node_y1, node_w, node_h, "1", "Home Landing", "User enters portfolio page")
    draw_flow_arrow(157, node_y1 + 18, 177, node_y1 + 18, "Scrolls")
    
    draw_flow_node(177, node_y1, node_w, node_h, "2", "Project Discovery", "Browses Mobile & Design cards")
    draw_flow_arrow(292, node_y1 + 18, 312, node_y1 + 18, "Click")
    
    draw_flow_node(312, node_y1, node_w, node_h, "3", "Modal Showcase", "Active drawer locks background")
    draw_flow_arrow(427, node_y1 + 18, 447, node_y1 + 18, "Interact")
    
    draw_flow_node(447, node_y1, node_w, node_h, "4", "Interactive Demo", "Variant tabs & contrast toggle")

    # Lower branch flows
    node_y2 = flow_y + 20
    
    # Sub-action A: Brand / PDF Download
    c.setFillColor(CLR_NOTE_BG)
    c.setStrokeColor(CLR_NOTE_BORDER)
    c.roundRect(42, node_y2, 140, 48, 4, fill=1, stroke=1)
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(50, node_y2 + 36, "A. PDF Guidelines & Downloads")
    c.setFont("Helvetica", 6)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(50, node_y2 + 24, "• bmd_brand_guide.pdf (Logo Rules)")
    c.drawString(50, node_y2 + 14, "• mood_board.pdf (Aesthetic Notes)")
    c.drawString(50, node_y2 + 4, "• photography_activity.pdf (Coursework)")
    
    # Sub-action B: Interactive Canvas Switching
    c.setFillColor(CLR_NOTE_BG)
    c.setStrokeColor(CLR_NOTE_BORDER)
    c.roundRect(198, node_y2, 175, 48, 4, fill=1, stroke=1)
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(206, node_y2 + 36, "B. In-Modal Asset Switcher")
    c.setFont("Helvetica", 6)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(206, node_y2 + 24, "• Logo variants (Badge, Horizontal, Icon, Sketch)")
    c.drawString(206, node_y2 + 14, "• Multi-channel ads (Landing, Display, Feed, Header)")
    c.drawString(206, node_y2 + 4, "• Dynamic color palette swatches & dimensions")

    # Sub-action C: Dismiss & Return
    c.setFillColor(colors.HexColor('#FEF2F2'))
    c.setStrokeColor(colors.HexColor('#EF4444'))
    c.roundRect(388, node_y2, 174, 48, 4, fill=1, stroke=1)
    c.setFillColor(colors.HexColor('#991B1B'))
    c.setFont("Helvetica-Bold", 7)
    c.drawString(396, node_y2 + 36, "C. Dismissal & Return State")
    c.setFont("Helvetica", 6)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(396, node_y2 + 24, "• Click [X] close button")
    c.drawString(396, node_y2 + 14, "• Click outside modal backdrop")
    c.drawString(396, node_y2 + 4, "• Press ESC key (Restores page scrolling)")

    # Clean Tree diagram arrows down to lower branch
    c.setStrokeColor(CLR_ACCENT)
    c.setLineWidth(1)
    # Stem down from Step 3
    c.line(369, node_y1, 369, node_y1 - 12)
    # Horizontal trunk
    c.line(112, node_y1 - 12, 475, node_y1 - 12)
    # 3 Drop arrows into sub-boxes
    draw_flow_arrow(112, node_y1 - 12, 112, node_y2 + 48, "")
    draw_flow_arrow(285, node_y1 - 12, 285, node_y2 + 48, "")
    draw_flow_arrow(475, node_y1 - 12, 475, node_y2 + 48, "")

    # -------------------------------------------------------------
    # SECTION 2: INTERACTIVE MODAL SHOWCASE WIREFRAME (Y: 600 -> 45)
    # -------------------------------------------------------------
    modal_sec_y = 45
    modal_sec_h = 555
    
    # Outer Backdrop Simulation (Darkened overlay)
    c.setFillColor(colors.HexColor('#E2E8F0'))
    c.setStrokeColor(CLR_BORDER)
    c.setLineWidth(1)
    c.roundRect(30, modal_sec_y, 552, modal_sec_h, 6, fill=1, stroke=1)
    
    # Backdrop indicator tag
    c.setFillColor(CLR_WIRE_LINE)
    c.setFont("Helvetica-Oblique", 7)
    c.drawString(42, modal_sec_y + modal_sec_h - 14, "Backdrop Overlay: rgba(0,0,0,0.4) with backdrop-filter: blur(8px)  [Clicking backdrop dismisses modal]")

    # The Modal Container (Centered dialog box)
    mod_x = 42
    mod_y = modal_sec_y + 12
    mod_w = 528
    mod_h = 520
    
    c.setFillColor(CLR_WHITE)
    c.setStrokeColor(CLR_BORDER)
    c.setLineWidth(1.2)
    c.roundRect(mod_x, mod_y, mod_w, mod_h, 8, fill=1, stroke=1)
    
    # Modal Header Bar
    mod_top = mod_y + mod_h
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(mod_x + 16, mod_top - 24, "BIGZ Mobile Development  /  Common Ground  /  Urban Threads")
    c.setFont("Helvetica", 7)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(mod_x + 16, mod_top - 34, "Brand Identity & Mascot Design System  |  Detailed Case Study & Interactive Canvas")
    
    # Modal Close Button [X]
    c.setFillColor(CLR_LIGHT_GRAY)
    c.setStrokeColor(CLR_MUTED)
    c.circle(mod_x + mod_w - 22, mod_top - 22, 10, fill=1, stroke=1)
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(mod_x + mod_w - 22, mod_top - 25, "×")
    
    # Modal Header Separator Line
    c.setStrokeColor(CLR_LIGHT_GRAY)
    c.setLineWidth(1)
    c.line(mod_x + 16, mod_top - 42, mod_x + mod_w - 16, mod_top - 42)
    
    # -------------------------------------------------------------
    # MODAL 2-COLUMN GRID (LEFT: SPECS, RIGHT: INTERACTIVE VIEWER)
    # -------------------------------------------------------------
    col_w = 238
    col_h = 450
    col_y = mod_y + 16
    
    # --- LEFT COLUMN: CASE STUDY & ANATOMY SPECS ---
    left_x = mod_x + 16
    
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(left_x, col_y + col_h - 10, "1. PROJECT OVERVIEW & PROBLEM STATEMENT")
    c.setStrokeColor(CLR_ACCENT)
    c.setLineWidth(1)
    c.line(left_x, col_y + col_h - 13, left_x + 110, col_y + col_h - 13)
    
    # Narrative lines
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.setLineWidth(2)
    c.line(left_x, col_y + col_h - 22, left_x + col_w - 10, col_y + col_h - 22)
    c.line(left_x, col_y + col_h - 28, left_x + col_w - 20, col_y + col_h - 28)
    c.line(left_x, col_y + col_h - 34, left_x + col_w - 15, col_y + col_h - 34)
    
    # Section: Design Anatomy & Architecture Grid
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(left_x, col_y + col_h - 52, "2. DESIGN ANATOMY & BRAND ARCHITECTURE")
    c.setStrokeColor(CLR_ACCENT)
    c.line(left_x, col_y + col_h - 55, left_x + 115, col_y + col_h - 55)
    
    # 4 Feature mini-cards
    specs = [
        ("Winking Developer Mascot", "Friendly smartphone companion symbolizing mobile agility."),
        ("Adaptive Geometry", "Vector grid mathematics with uniform stroke weight."),
        ("Multi-Platform Contrast", "Dark/Light outer ring offsets preventing color bleeding."),
        ("Curated Palette Specs", "Electric Cobalt (#0066FF) & Deep Charcoal (#0C0D12).")
    ]
    for idx, (stitle, sdesc) in enumerate(specs):
        bx = left_x
        by = col_y + col_h - 70 - idx * 36
        c.setFillColor(CLR_LIGHT_GRAY)
        c.setStrokeColor(CLR_MUTED)
        c.setLineWidth(0.6)
        c.roundRect(bx, by - 22, col_w, 30, 3, fill=1, stroke=1)
        
        c.setFillColor(CLR_ACCENT)
        c.circle(bx + 10, by - 7, 3, fill=1, stroke=0)
        c.setFillColor(CLR_BORDER)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(bx + 18, by - 9, stitle)
        c.setFont("Helvetica", 5.5)
        c.setFillColor(CLR_WIRE_LINE)
        c.drawString(bx + 18, by - 18, sdesc)
        
    # Section: Design Process Challenges
    proc_y = col_y + 110
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(left_x, proc_y + 36, "3. CREATIVE EXECUTION & CHALLENGES")
    c.setStrokeColor(CLR_ACCENT)
    c.line(left_x, proc_y + 33, left_x + 95, proc_y + 33)
    
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.setLineWidth(2)
    c.line(left_x, proc_y + 22, left_x + col_w - 10, proc_y + 22)
    c.line(left_x, proc_y + 16, left_x + col_w - 25, proc_y + 16)
    c.line(left_x, proc_y + 10, left_x + col_w - 18, proc_y + 10)
    c.line(left_x, proc_y + 4, left_x + col_w - 40, proc_y + 4)
    
    # Section: Deliverable Downloads
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(left_x, col_y + 42, "4. PROJECT DOCUMENTATION & PDFS")
    c.setStrokeColor(CLR_ACCENT)
    c.line(left_x, col_y + 39, left_x + 90, col_y + 39)
    
    draw_pill(c, left_x, col_y + 12, col_w, 22, "Official Brand Manual PDF [bmd_brand_guide.pdf]  →", fill_color=CLR_NOTE_BG, text_color=CLR_ACCENT, font_size=6.5)

    # Divider between columns
    c.setStrokeColor(CLR_LIGHT_GRAY)
    c.setLineWidth(1)
    c.line(mod_x + 264, col_y, mod_x + 264, col_y + col_h)

    # --- RIGHT COLUMN: INTERACTIVE SIMULATOR & PREVIEW CANVAS ---
    right_x = mod_x + 276
    
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(right_x, col_y + col_h - 10, "INTERACTIVE BRAND SYSTEM VIEWER / CANVAS")
    c.setFont("Helvetica", 6)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(right_x, col_y + col_h - 19, "Live asset inspection with surface contrast & variant switching")
    
    # Interactive Tabs Row
    tab_y = col_y + col_h - 38
    draw_pill(c, right_x, tab_y, 44, 14, "Badge", fill_color=CLR_BORDER, text_color=CLR_WHITE, font_size=6)
    draw_pill(c, right_x + 48, tab_y, 48, 14, "Horizontal", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=6)
    draw_pill(c, right_x + 100, tab_y, 44, 14, "Vertical", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=6)
    draw_pill(c, right_x + 148, tab_y, 40, 14, "Icon", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=6)
    draw_pill(c, right_x + 192, tab_y, 44, 14, "Sketches", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=6)
    
    # Surface Contrast Controls
    surf_y = tab_y - 20
    c.setFont("Helvetica", 6)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(right_x, surf_y + 4, "Surface Mode:")
    draw_pill(c, right_x + 48, surf_y, 44, 13, "Dark Surface", fill_color=CLR_BORDER, text_color=CLR_WHITE, font_size=5.5)
    draw_pill(c, right_x + 96, surf_y, 44, 13, "Light Surface", fill_color=CLR_LIGHT_GRAY, text_color=CLR_BORDER, font_size=5.5)
    
    # Preview Canvas Frame
    canvas_y = surf_y - 232
    canvas_h = 224
    c.setFillColor(colors.HexColor('#0C0D12')) # Dark surface default
    c.setStrokeColor(CLR_MUTED)
    c.setLineWidth(1)
    c.roundRect(right_x, canvas_y, col_w, canvas_h, 6, fill=1, stroke=1)
    
    # Asset inside canvas (Large placeholder X)
    draw_placeholder_box(c, right_x + 38, canvas_y + 36, col_w - 76, 148, "[Dynamic Brand Asset / Logo Preview]")
    c.setFillColor(CLR_WHITE)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawCentredString(right_x + col_w/2, canvas_y + 20, "Cross-fade dynamic transition on variant / surface switch")
    
    # Artwork Info Spec Sheet Card
    info_y = canvas_y - 120
    info_h = 112
    c.setFillColor(CLR_WHITE)
    c.setStrokeColor(CLR_MUTED)
    c.setLineWidth(0.8)
    c.roundRect(right_x, info_y, col_w, info_h, 4, fill=1, stroke=1)
    
    c.setFillColor(CLR_BORDER)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(right_x + 10, info_y + info_h - 15, "Asset Metadata & Dimension Specifications")
    
    # Dim pill
    draw_pill(c, right_x + col_w - 68, info_y + info_h - 18, 58, 12, "Vector · Scalable", fill_color=CLR_LIGHT_GRAY, font_size=5.5)
    
    c.setFont("Helvetica", 6)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(right_x + 10, info_y + info_h - 30, "Badge emblem lockup with circular contrast border & mascot.")
    
    # Swatches
    c.setFont("Helvetica-Bold", 6)
    c.setFillColor(CLR_BORDER)
    c.drawString(right_x + 10, info_y + info_h - 48, "PALETTE SWATCHES:")
    
    swatches = [
        ("#0066FF", "Cobalt"),
        ("#0C0D12", "Obsidian"),
        ("#00C6FF", "Cyan"),
        ("#FFFFFF", "White")
    ]
    for si, (sc, sname) in enumerate(swatches):
        sx = right_x + 10 + si * 54
        sy = info_y + 26
        c.setFillColor(colors.HexColor(sc))
        c.setStrokeColor(CLR_MUTED)
        c.circle(sx + 6, sy + 6, 6, fill=1, stroke=1)
        c.setFillColor(CLR_BORDER)
        c.setFont("Helvetica", 5.5)
        c.drawString(sx + 16, sy + 3.5, sname)
        c.setFont("Helvetica", 5)
        c.setFillColor(CLR_WIRE_LINE)
        c.drawString(sx + 16, sy - 4, sc)
        
    c.setFont("Helvetica-Oblique", 5.5)
    c.setFillColor(CLR_WIRE_LINE)
    c.drawString(right_x + 10, info_y + 10, "Supports Common Ground (Coffee) & Urban Threads (Streetwear) canvases.")

def main():
    output_pdf = "Lesson9_Activity7_Cacao_Portfolio_Wireframe.pdf"
    
    # Also prepare the student submission folder as requested in instructions:
    # "Inside your Folder create another folder and name it as YourLastName_MyPortfolio"
    sub_dir = "Cacao_MyPortfolio"
    os.makedirs(sub_dir, exist_ok=True)
    sub_pdf = os.path.join(sub_dir, "Cacao_Portfolio_Wireframe.pdf")
    
    c = canvas.Canvas(output_pdf, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
    
    # Render Page 1
    build_page_1(c)
    c.showPage()
    
    # Render Page 2
    build_page_2(c)
    c.showPage()
    
    c.save()
    print(f"Successfully generated wireframe PDF: {output_pdf}")
    
    # Copy to submission folder
    import shutil
    shutil.copyfile(output_pdf, sub_pdf)
    print(f"Copied to submission folder: {sub_pdf}")
    
    # Render PNG previews via PyMuPDF for visual inspection
    doc = fitz.open(output_pdf)
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        preview_png = f"wireframe_page_{i+1}.png"
        pix.save(preview_png)
        print(f"Generated preview image: {preview_png} ({pix.width}x{pix.height})")

if __name__ == "__main__":
    main()
