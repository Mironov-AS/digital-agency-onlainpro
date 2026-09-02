.class final Lcom/astrob/navi/astrobnavilib/InputTextView$2;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/widget/TextView$OnEditorActionListener;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/InputTextView;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Lcom/astrob/navi/astrobnavilib/InputTextView;


# direct methods
.method constructor <init>(Lcom/astrob/navi/astrobnavilib/InputTextView;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/InputTextView$2;->a:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public final onEditorAction(Landroid/widget/TextView;ILandroid/view/KeyEvent;)Z
    .locals 0

    if-eqz p3, :cond_0

    const/16 p1, 0x42

    invoke-virtual {p3}, Landroid/view/KeyEvent;->getKeyCode()I

    move-result p2

    if-ne p1, p2, :cond_0

    invoke-virtual {p3}, Landroid/view/KeyEvent;->getAction()I

    move-result p1

    if-nez p1, :cond_0

    const-string p1, ""

    const/4 p2, 0x2

    const/4 p3, 0x1

    invoke-static {p1, p2, p3}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->inputKey(Ljava/lang/String;IZ)V

    return p3

    :cond_0
    const/4 p1, 0x0

    return p1
.end method
