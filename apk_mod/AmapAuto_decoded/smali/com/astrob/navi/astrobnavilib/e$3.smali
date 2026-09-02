.class final Lcom/astrob/navi/astrobnavilib/e$3;
.super Ljava/util/TimerTask;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Lcom/astrob/navi/astrobnavilib/e;->a(Ljava/lang/String;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Lcom/astrob/navi/astrobnavilib/e;


# direct methods
.method constructor <init>(Lcom/astrob/navi/astrobnavilib/e;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$3;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-direct {p0}, Ljava/util/TimerTask;-><init>()V

    return-void
.end method


# virtual methods
.method public final run()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$3;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->c(Lcom/astrob/navi/astrobnavilib/e;)I

    move-result v0

    if-lez v0, :cond_0

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$3;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->d(Lcom/astrob/navi/astrobnavilib/e;)Landroid/os/Handler;

    move-result-object v0

    const/4 v1, 0x5

    goto :goto_0

    :cond_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$3;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->a(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Timer;

    move-result-object v0

    invoke-virtual {v0}, Ljava/util/Timer;->cancel()V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$3;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->b(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Timer;

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$3;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->d(Lcom/astrob/navi/astrobnavilib/e;)Landroid/os/Handler;

    move-result-object v0

    const/16 v1, 0x64

    :goto_0
    invoke-virtual {v0, v1}, Landroid/os/Handler;->sendEmptyMessage(I)Z

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$3;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->e(Lcom/astrob/navi/astrobnavilib/e;)I

    return-void
.end method
