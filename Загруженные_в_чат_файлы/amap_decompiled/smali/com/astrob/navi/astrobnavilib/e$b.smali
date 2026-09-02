.class final Lcom/astrob/navi/astrobnavilib/e$b;
.super Landroid/os/Handler;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/e;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x8
    name = "b"
.end annotation


# instance fields
.field private a:Ljava/lang/ref/WeakReference;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/lang/ref/WeakReference<",
            "Lcom/astrob/navi/astrobnavilib/e;",
            ">;"
        }
    .end annotation
.end field


# direct methods
.method constructor <init>(Lcom/astrob/navi/astrobnavilib/e;)V
    .locals 1

    invoke-direct {p0}, Landroid/os/Handler;-><init>()V

    new-instance v0, Ljava/lang/ref/WeakReference;

    invoke-direct {v0, p1}, Ljava/lang/ref/WeakReference;-><init>(Ljava/lang/Object;)V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$b;->a:Ljava/lang/ref/WeakReference;

    return-void
.end method


# virtual methods
.method public final handleMessage(Landroid/os/Message;)V
    .locals 7

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$b;->a:Ljava/lang/ref/WeakReference;

    if-eqz v0, :cond_a

    invoke-virtual {v0}, Ljava/lang/ref/WeakReference;->get()Ljava/lang/Object;

    move-result-object v0

    if-nez v0, :cond_0

    goto/16 :goto_0

    :cond_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e$b;->a:Ljava/lang/ref/WeakReference;

    invoke-virtual {v0}, Ljava/lang/ref/WeakReference;->get()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Lcom/astrob/navi/astrobnavilib/e;

    iget v1, p1, Landroid/os/Message;->what:I

    const/4 v2, 0x3

    if-ne v1, v2, :cond_3

    iget p1, p1, Landroid/os/Message;->arg1:I

    if-nez p1, :cond_1

    const-string p1, "The SD card has not been mounted, please try again!"

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/e;->a(Ljava/lang/String;)V

    return-void

    :cond_1
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object p1

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/g;->b()Z

    move-result p1

    if-nez p1, :cond_2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/g;->a:Ljava/lang/String;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/e;->a(Ljava/lang/String;)V

    return-void

    :cond_2
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/g;->b:Ljava/lang/String;

    invoke-static {v0, p1}, Lcom/astrob/navi/astrobnavilib/e;->a(Lcom/astrob/navi/astrobnavilib/e;Ljava/lang/String;)Ljava/lang/String;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->g(Lcom/astrob/navi/astrobnavilib/e;)V

    return-void

    :cond_3
    iget v1, p1, Landroid/os/Message;->what:I

    const/4 v3, 0x4

    const/4 v4, 0x0

    if-ne v1, v3, :cond_4

    iget-object p1, v0, Lcom/astrob/navi/astrobnavilib/e;->d:Landroid/widget/ImageView;

    if-eqz p1, :cond_a

    iget-object p1, v0, Lcom/astrob/navi/astrobnavilib/e;->d:Landroid/widget/ImageView;

    const/16 v1, 0x8

    invoke-virtual {p1, v1}, Landroid/widget/ImageView;->setVisibility(I)V

    const-string p1, "MQHandler"

    const-string v1, "LaunchImgView hide"

    invoke-static {p1, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->f(Lcom/astrob/navi/astrobnavilib/e;)Lcom/astrob/navi/astrobnavilib/h;

    move-result-object p1

    iput v2, p1, Lcom/astrob/navi/astrobnavilib/h;->e:I

    iput v4, p1, Lcom/astrob/navi/astrobnavilib/h;->d:I

    return-void

    :cond_4
    iget v1, p1, Landroid/os/Message;->what:I

    const/4 v3, 0x5

    if-ne v1, v3, :cond_5

    sget p1, Lcom/astrob/navi/astrobnavilib/n$a;->quit:I

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/e;->getString(I)Ljava/lang/String;

    move-result-object p1

    sget v1, Lcom/astrob/navi/astrobnavilib/n$a;->second_unit:I

    invoke-virtual {v0, v1}, Lcom/astrob/navi/astrobnavilib/e;->getString(I)Ljava/lang/String;

    move-result-object v1

    iget-object v3, v0, Lcom/astrob/navi/astrobnavilib/e;->f:Landroid/widget/TextView;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v5

    iget-object v5, v5, Lcom/astrob/navi/astrobnavilib/g;->a:Ljava/lang/String;

    invoke-virtual {v3, v5}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    iget-object v3, v0, Lcom/astrob/navi/astrobnavilib/e;->g:Landroid/widget/Button;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->h(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Locale;

    move-result-object v5

    const-string v6, "%s(%d%s)"

    new-array v2, v2, [Ljava/lang/Object;

    aput-object p1, v2, v4

    const/4 p1, 0x1

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/e;->c(Lcom/astrob/navi/astrobnavilib/e;)I

    move-result v0

    invoke-static {v0}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v0

    aput-object v0, v2, p1

    const/4 p1, 0x2

    aput-object v1, v2, p1

    invoke-static {v5, v6, v2}, Ljava/lang/String;->format(Ljava/util/Locale;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {v3, p1}, Landroid/widget/Button;->setText(Ljava/lang/CharSequence;)V

    return-void

    :cond_5
    iget v1, p1, Landroid/os/Message;->what:I

    const/16 v2, 0x64

    if-ne v1, v2, :cond_6

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/e;->g()V

    return-void

    :cond_6
    iget v1, p1, Landroid/os/Message;->what:I

    const/16 v2, 0x65

    if-ne v1, v2, :cond_8

    const-string p1, "content://com.carocean.status.provider/sys"

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/e;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v0

    const-string v1, "SYS_ACC_STATUS"

    invoke-static {p1, v0, v1}, Lcom/astrob/navi/astrobnavilib/e;->a(Ljava/lang/String;Landroid/content/ContentResolver;Ljava/lang/String;)I

    move-result p1

    if-nez p1, :cond_7

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->saveUserData()Z

    :cond_7
    return-void

    :cond_8
    iget v1, p1, Landroid/os/Message;->what:I

    const/16 v2, 0x66

    if-ne v1, v2, :cond_9

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/e;->g()V

    return-void

    :cond_9
    iget p1, p1, Landroid/os/Message;->what:I

    const/16 v1, 0x67

    if-ne p1, v1, :cond_a

    new-instance p1, Landroid/content/Intent;

    const-string v1, "message_outter"

    invoke-direct {p1, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v1

    iget-object v1, v1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v1, v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->handleProtocal(Landroid/content/Context;Landroid/content/Intent;)V

    :cond_a
    :goto_0
    return-void
.end method
