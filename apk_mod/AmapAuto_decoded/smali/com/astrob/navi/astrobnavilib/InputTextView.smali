.class public Lcom/astrob/navi/astrobnavilib/InputTextView;
.super Landroid/support/v7/widget/h;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/astrob/navi/astrobnavilib/InputTextView$a;
    }
.end annotation


# instance fields
.field a:Ljava/lang/String;


# direct methods
.method public constructor <init>(Landroid/content/Context;Landroid/util/AttributeSet;)V
    .locals 1

    const/4 v0, 0x0

    invoke-direct {p0, p1, p2, v0}, Lcom/astrob/navi/astrobnavilib/InputTextView;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;B)V

    return-void
.end method

.method private constructor <init>(Landroid/content/Context;Landroid/util/AttributeSet;B)V
    .locals 0

    const/4 p3, 0x0

    invoke-direct {p0, p1, p2, p3}, Landroid/support/v7/widget/h;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;I)V

    const/4 p1, 0x1

    invoke-virtual {p0, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setFocusable(Z)V

    invoke-virtual {p0, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setFocusableInTouchMode(Z)V

    const p2, 0x10000003

    invoke-virtual {p0, p2}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setImeOptions(I)V

    invoke-virtual {p0, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setSingleLine(Z)V

    invoke-virtual {p0, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setLines(I)V

    new-instance p1, Lcom/astrob/navi/astrobnavilib/InputTextView$1;

    invoke-direct {p1, p0}, Lcom/astrob/navi/astrobnavilib/InputTextView$1;-><init>(Lcom/astrob/navi/astrobnavilib/InputTextView;)V

    invoke-virtual {p0, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->addTextChangedListener(Landroid/text/TextWatcher;)V

    new-instance p1, Lcom/astrob/navi/astrobnavilib/InputTextView$2;

    invoke-direct {p1, p0}, Lcom/astrob/navi/astrobnavilib/InputTextView$2;-><init>(Lcom/astrob/navi/astrobnavilib/InputTextView;)V

    invoke-virtual {p0, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setOnEditorActionListener(Landroid/widget/TextView$OnEditorActionListener;)V

    return-void
.end method

.method static synthetic a(Lcom/astrob/navi/astrobnavilib/InputTextView;Ljava/lang/String;)Ljava/lang/String;
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/InputTextView;->a:Ljava/lang/String;

    return-object p1
.end method


# virtual methods
.method public onCheckIsTextEditor()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method

.method public onCreateInputConnection(Landroid/view/inputmethod/EditorInfo;)Landroid/view/inputmethod/InputConnection;
    .locals 1

    new-instance v0, Lcom/astrob/navi/astrobnavilib/InputTextView$a;

    invoke-super {p0, p1}, Landroid/support/v7/widget/h;->onCreateInputConnection(Landroid/view/inputmethod/EditorInfo;)Landroid/view/inputmethod/InputConnection;

    move-result-object p1

    invoke-direct {v0, p0, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView$a;-><init>(Lcom/astrob/navi/astrobnavilib/InputTextView;Landroid/view/inputmethod/InputConnection;)V

    return-object v0
.end method
