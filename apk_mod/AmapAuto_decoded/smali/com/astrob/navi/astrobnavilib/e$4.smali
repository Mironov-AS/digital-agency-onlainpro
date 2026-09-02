.class final Lcom/astrob/navi/astrobnavilib/e$4;
.super Landroid/database/ContentObserver;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Lcom/astrob/navi/astrobnavilib/e;->i()V
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

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$4;->a:Lcom/astrob/navi/astrobnavilib/e;

    const/4 p1, 0x0

    invoke-direct {p0, p1}, Landroid/database/ContentObserver;-><init>(Landroid/os/Handler;)V

    return-void
.end method


# virtual methods
.method public final onChange(ZLandroid/net/Uri;)V
    .locals 0

    invoke-virtual {p2}, Landroid/net/Uri;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p2

    iget-object p2, p2, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p2}, Lcom/astrob/navi/astrobnavilib/j;->getContentProviderUri()Ljava/lang/String;

    move-result-object p2

    invoke-virtual {p1, p2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_0

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e$4;->a:Lcom/astrob/navi/astrobnavilib/e;

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/e;->d(Lcom/astrob/navi/astrobnavilib/e;)Landroid/os/Handler;

    move-result-object p1

    const/16 p2, 0x65

    invoke-virtual {p1, p2}, Landroid/os/Handler;->sendEmptyMessage(I)Z

    :cond_0
    return-void
.end method
