.class final Lcom/astrob/navi/astrobnavilib/e$2;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/view/View$OnClickListener;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/e;
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

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$2;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public final onClick(Landroid/view/View;)V
    .locals 0

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$2;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/e;->a(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Timer;

    move-result-object p1

    if-eqz p1, :cond_0

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$2;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/e;->a(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Timer;

    move-result-object p1

    invoke-virtual {p1}, Ljava/util/Timer;->cancel()V

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$2;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/e;->b(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Timer;

    :cond_0
    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$2;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/e;->g()V

    return-void
.end method
