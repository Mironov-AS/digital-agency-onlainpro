.class public Lcom/astrob/turbodog/WelcomeActivity;
.super Lcom/astrob/navi/astrobnavilib/e;


# instance fields
.field private final h:Ljava/lang/String;


# direct methods
.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/e;-><init>()V

    invoke-virtual {p0}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->h:Ljava/lang/String;

    return-void
.end method


# virtual methods
.method public final b()V
    .locals 4

    const v0, 0x7f070049

    invoke-virtual {p0, v0}, Lcom/astrob/turbodog/WelcomeActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/widget/FrameLayout;

    iput-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->a:Landroid/widget/FrameLayout;

    const v0, 0x7f070047

    invoke-virtual {p0, v0}, Lcom/astrob/turbodog/WelcomeActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Lcom/astrob/navi/astrobnavilib/InputTextView;

    iput-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    const v0, 0x7f070048

    invoke-virtual {p0, v0}, Lcom/astrob/turbodog/WelcomeActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/widget/ImageView;

    iput-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->d:Landroid/widget/ImageView;

    const v0, 0x7f070045

    invoke-virtual {p0, v0}, Lcom/astrob/turbodog/WelcomeActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/widget/LinearLayout;

    iput-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->e:Landroid/widget/LinearLayout;

    const v0, 0x7f070044

    invoke-virtual {p0, v0}, Lcom/astrob/turbodog/WelcomeActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/widget/TextView;

    iput-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->f:Landroid/widget/TextView;

    const v0, 0x7f070046

    invoke-virtual {p0, v0}, Lcom/astrob/turbodog/WelcomeActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/widget/Button;

    iput-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->g:Landroid/widget/Button;

    iget-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    const/16 v1, 0x8

    invoke-virtual {v0, v1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->setVisibility(I)V

    iget-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->d:Landroid/widget/ImageView;

    invoke-virtual {v0, v1}, Landroid/widget/ImageView;->setVisibility(I)V

    iget-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->e:Landroid/widget/LinearLayout;

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setVisibility(I)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    if-eqz v0, :cond_1

    invoke-virtual {v0, p0}, Lcom/astrob/navi/astrobnavilib/j;->resetLaunchErrorTipViewPos(Landroid/content/Context;)Landroid/os/Bundle;

    move-result-object v0

    if-eqz v0, :cond_1

    invoke-virtual {v0}, Landroid/os/Bundle;->isEmpty()Z

    move-result v1

    if-nez v1, :cond_1

    const-string v1, "tipViewMarginStart"

    const/4 v2, -0x1

    invoke-virtual {v0, v1, v2}, Landroid/os/Bundle;->getInt(Ljava/lang/String;I)I

    move-result v1

    const-string v3, "exitBtnMarginEnd"

    invoke-virtual {v0, v3, v2}, Landroid/os/Bundle;->getInt(Ljava/lang/String;I)I

    move-result v0

    if-eq v1, v2, :cond_0

    iget-object v3, p0, Lcom/astrob/turbodog/WelcomeActivity;->f:Landroid/widget/TextView;

    invoke-virtual {v3}, Landroid/widget/TextView;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v3

    check-cast v3, Landroid/widget/LinearLayout$LayoutParams;

    invoke-virtual {v3, v1}, Landroid/widget/LinearLayout$LayoutParams;->setMarginStart(I)V

    iget-object v1, p0, Lcom/astrob/turbodog/WelcomeActivity;->f:Landroid/widget/TextView;

    invoke-virtual {v1, v3}, Landroid/widget/TextView;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    :cond_0
    if-eq v0, v2, :cond_1

    iget-object v1, p0, Lcom/astrob/turbodog/WelcomeActivity;->g:Landroid/widget/Button;

    invoke-virtual {v1}, Landroid/widget/Button;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v1

    check-cast v1, Landroid/widget/LinearLayout$LayoutParams;

    invoke-virtual {v1, v0}, Landroid/widget/LinearLayout$LayoutParams;->setMarginEnd(I)V

    iget-object v0, p0, Lcom/astrob/turbodog/WelcomeActivity;->g:Landroid/widget/Button;

    invoke-virtual {v0, v1}, Landroid/widget/Button;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    :cond_1
    return-void
.end method

.method public final c()V
    .locals 4

    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.MAIN"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const/high16 v1, 0x10000000

    invoke-virtual {v0, v1}, Landroid/content/Intent;->setFlags(I)Landroid/content/Intent;

    const-string v1, "android.intent.category.HOME"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    new-instance v1, Landroid/content/ComponentName;

    invoke-virtual {p0}, Lcom/astrob/turbodog/WelcomeActivity;->getApplicationInfo()Landroid/content/pm/ApplicationInfo;

    move-result-object v2

    iget-object v2, v2, Landroid/content/pm/ApplicationInfo;->processName:Ljava/lang/String;

    const-class v3, Lcom/astrob/turbodog/WelcomeActivity;

    invoke-virtual {v3}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v3

    invoke-direct {v1, v2, v3}, Landroid/content/ComponentName;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/content/Intent;->setComponent(Landroid/content/ComponentName;)Landroid/content/Intent;

    invoke-virtual {p0, v0}, Lcom/astrob/turbodog/WelcomeActivity;->startActivity(Landroid/content/Intent;)V

    return-void
.end method

.method public onCreate(Landroid/os/Bundle;)V
    .locals 0

    invoke-super {p0, p1}, Lcom/astrob/navi/astrobnavilib/e;->onCreate(Landroid/os/Bundle;)V

    return-void
.end method
