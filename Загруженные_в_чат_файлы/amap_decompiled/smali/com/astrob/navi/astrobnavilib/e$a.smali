.class final Lcom/astrob/navi/astrobnavilib/e$a;
.super Landroid/content/BroadcastReceiver;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/e;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = "a"
.end annotation


# instance fields
.field final synthetic a:Lcom/astrob/navi/astrobnavilib/e;


# direct methods
.method private constructor <init>(Lcom/astrob/navi/astrobnavilib/e;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-direct {p0}, Landroid/content/BroadcastReceiver;-><init>()V

    return-void
.end method

.method synthetic constructor <init>(Lcom/astrob/navi/astrobnavilib/e;B)V
    .locals 0

    invoke-direct {p0, p1}, Lcom/astrob/navi/astrobnavilib/e$a;-><init>(Lcom/astrob/navi/astrobnavilib/e;)V

    return-void
.end method


# virtual methods
.method public final onReceive(Landroid/content/Context;Landroid/content/Intent;)V
    .locals 3

    invoke-virtual {p2}, Landroid/content/Intent;->getAction()Ljava/lang/String;

    move-result-object v0

    const-string v1, "EXIT_ACTION"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_0

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/e;->g()V

    return-void

    :cond_0
    const-string v1, "com.astrob.show.gpsdisabled.tip"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_1

    const-string p2, "The positioning service is not open, please open it again!"

    const/4 v0, 0x1

    invoke-static {p1, p2, v0}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p1

    invoke-virtual {p1}, Landroid/widget/Toast;->show()V

    return-void

    :cond_1
    const-string p1, "SHOW_SYS_KEYBOARD"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    const/4 v1, 0x0

    if-eqz p1, :cond_2

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-virtual {p1, v1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setVisibility(I)V

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->requestFocus()Z

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/d;->a()Lcom/astrob/navi/astrobnavilib/d;

    move-result-object p1

    iget-object p2, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p2, p2, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/d;->a:Landroid/view/inputmethod/InputMethodManager;

    invoke-virtual {p1, p2, v1}, Landroid/view/inputmethod/InputMethodManager;->showSoftInput(Landroid/view/View;I)Z

    return-void

    :cond_2
    const-string p1, "HIDE_SYS_KEYBOARD"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_4

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/d;->a()Lcom/astrob/navi/astrobnavilib/d;

    move-result-object p1

    iget-object p2, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p2, p2, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    iget-object v0, p1, Lcom/astrob/navi/astrobnavilib/d;->a:Landroid/view/inputmethod/InputMethodManager;

    invoke-virtual {v0}, Landroid/view/inputmethod/InputMethodManager;->isActive()Z

    move-result v0

    if-eqz v0, :cond_3

    const-string v0, "hickey"

    const-string v2, "hideSoftInput:hideSoftInputFromWindow"

    invoke-static {v0, v2}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/d;->a:Landroid/view/inputmethod/InputMethodManager;

    invoke-virtual {p2}, Landroid/view/View;->getWindowToken()Landroid/os/IBinder;

    move-result-object p2

    invoke-virtual {p1, p2, v1}, Landroid/view/inputmethod/InputMethodManager;->hideSoftInputFromWindow(Landroid/os/IBinder;I)Z

    :cond_3
    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    const/16 p2, 0x8

    invoke-virtual {p1, p2}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setVisibility(I)V

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->clearFocus()V

    return-void

    :cond_4
    const-string p1, "UPDATE_SYS_KEYBOARD_CURSOR"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_6

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    const-string v0, "cursor"

    invoke-virtual {p2, v0, v1}, Landroid/content/Intent;->getIntExtra(Ljava/lang/String;I)I

    move-result p2

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->getEditableText()Landroid/text/Editable;

    move-result-object v0

    invoke-interface {v0}, Landroid/text/Editable;->length()I

    move-result v0

    if-lez v0, :cond_5

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->getEditableText()Landroid/text/Editable;

    move-result-object v0

    invoke-interface {v0}, Landroid/text/Editable;->length()I

    move-result v0

    if-gt p2, v0, :cond_5

    if-ltz p2, :cond_5

    invoke-virtual {p1, p2}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setSelection(I)V

    :cond_5
    return-void

    :cond_6
    const-string p1, "CLEAR_SYS_KEYBOARD"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_7

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    const-string p2, ""

    iput-object p2, p1, Lcom/astrob/navi/astrobnavilib/InputTextView;->a:Ljava/lang/String;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->clearComposingText()V

    const-string p2, ""

    invoke-virtual {p1, p2}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setText(Ljava/lang/CharSequence;)V

    return-void

    :cond_7
    const-string p1, "INIT_SYS_KEYBOARD"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_8

    const-string p1, "text"

    invoke-virtual {p2, p1}, Landroid/content/Intent;->getStringExtra(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    iget-object p2, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    iget-object p2, p2, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-virtual {p2, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setText(Ljava/lang/CharSequence;)V

    return-void

    :cond_8
    const-string p1, "MOVE_TASK_TO_BACK"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_9

    new-instance p1, Landroid/content/Intent;

    const-string p2, "android.intent.action.MAIN"

    invoke-direct {p1, p2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const/high16 p2, 0x10000000

    invoke-virtual {p1, p2}, Landroid/content/Intent;->setFlags(I)Landroid/content/Intent;

    const-string p2, "android.intent.category.HOME"

    invoke-virtual {p1, p2}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    iget-object p2, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-virtual {p2, p1}, Lcom/astrob/navi/astrobnavilib/e;->startActivity(Landroid/content/Intent;)V

    return-void

    :cond_9
    const-string p1, "MOVE_TASK_TO_FRONT"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_a

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/e;->c()V

    return-void

    :cond_a
    const-string p1, "RESUME_MAPVIEW"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_b

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$a;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/e;->f(Lcom/astrob/navi/astrobnavilib/e;)Lcom/astrob/navi/astrobnavilib/h;

    move-result-object p1

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/h;->a()V

    return-void

    :cond_b
    const-string p1, "android.intent.action.LOCALE_CHANGED"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_c

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->getCurLanguage()I

    move-result p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->changeLanguage(I)V

    :cond_c
    return-void
.end method
