.class Lcom/astrob/navi/astrobnavilib/d;
.super Ljava/lang/Object;


# static fields
.field private static b:Lcom/astrob/navi/astrobnavilib/d;


# instance fields
.field a:Landroid/view/inputmethod/InputMethodManager;


# direct methods
.method private constructor <init>(Landroid/content/Context;)V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const-string v0, "input_method"

    invoke-virtual {p1, v0}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object p1

    check-cast p1, Landroid/view/inputmethod/InputMethodManager;

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/d;->a:Landroid/view/inputmethod/InputMethodManager;

    return-void
.end method

.method public static declared-synchronized a()Lcom/astrob/navi/astrobnavilib/d;
    .locals 4

    const-class v0, Lcom/astrob/navi/astrobnavilib/d;

    monitor-enter v0

    :try_start_0
    const-class v1, Lcom/astrob/navi/astrobnavilib/d;

    monitor-enter v1
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_1

    :try_start_1
    sget-object v2, Lcom/astrob/navi/astrobnavilib/d;->b:Lcom/astrob/navi/astrobnavilib/d;

    if-nez v2, :cond_0

    new-instance v2, Lcom/astrob/navi/astrobnavilib/d;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v3

    iget-object v3, v3, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v3}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v3

    invoke-direct {v2, v3}, Lcom/astrob/navi/astrobnavilib/d;-><init>(Landroid/content/Context;)V

    sput-object v2, Lcom/astrob/navi/astrobnavilib/d;->b:Lcom/astrob/navi/astrobnavilib/d;

    :cond_0
    sget-object v2, Lcom/astrob/navi/astrobnavilib/d;->b:Lcom/astrob/navi/astrobnavilib/d;

    monitor-exit v1
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    monitor-exit v0

    return-object v2

    :catchall_0
    move-exception v2

    :try_start_2
    monitor-exit v1
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    :try_start_3
    throw v2
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_1

    :catchall_1
    move-exception v1

    monitor-exit v0

    throw v1
.end method
