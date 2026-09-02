.class final Lcom/astrob/navi/astrobnavilib/f$a;
.super Landroid/content/BroadcastReceiver;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/f;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = "a"
.end annotation


# instance fields
.field final synthetic a:Lcom/astrob/navi/astrobnavilib/f;


# direct methods
.method private constructor <init>(Lcom/astrob/navi/astrobnavilib/f;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/f$a;->a:Lcom/astrob/navi/astrobnavilib/f;

    invoke-direct {p0}, Landroid/content/BroadcastReceiver;-><init>()V

    return-void
.end method

.method synthetic constructor <init>(Lcom/astrob/navi/astrobnavilib/f;B)V
    .locals 0

    invoke-direct {p0, p1}, Lcom/astrob/navi/astrobnavilib/f$a;-><init>(Lcom/astrob/navi/astrobnavilib/f;)V

    return-void
.end method


# virtual methods
.method public final onReceive(Landroid/content/Context;Landroid/content/Intent;)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1, p2}, Lcom/astrob/navi/astrobnavilib/j;->handleProtocal(Landroid/content/Context;Landroid/content/Intent;)V

    return-void
.end method
