.class public final Landroid/support/v7/widget/aj;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/support/v7/widget/r;


# instance fields
.field a:Landroid/support/v7/widget/Toolbar;

.field b:Ljava/lang/CharSequence;

.field c:Landroid/view/Window$Callback;

.field d:Z

.field private e:I

.field private f:Landroid/view/View;

.field private g:Landroid/graphics/drawable/Drawable;

.field private h:Landroid/graphics/drawable/Drawable;

.field private i:Landroid/graphics/drawable/Drawable;

.field private j:Z

.field private k:Ljava/lang/CharSequence;

.field private l:Ljava/lang/CharSequence;

.field private m:I

.field private n:I

.field private o:Landroid/graphics/drawable/Drawable;


# direct methods
.method public constructor <init>(Landroid/support/v7/widget/Toolbar;)V
    .locals 1

    sget v0, Landroid/support/v7/a/a$h;->abc_action_bar_up_description:I

    invoke-direct {p0, p1, v0}, Landroid/support/v7/widget/aj;-><init>(Landroid/support/v7/widget/Toolbar;I)V

    return-void
.end method

.method private constructor <init>(Landroid/support/v7/widget/Toolbar;I)V
    .locals 6

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/4 v0, 0x0

    iput v0, p0, Landroid/support/v7/widget/aj;->m:I

    iput v0, p0, Landroid/support/v7/widget/aj;->n:I

    iput-object p1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {p1}, Landroid/support/v7/widget/Toolbar;->getTitle()Ljava/lang/CharSequence;

    move-result-object v1

    iput-object v1, p0, Landroid/support/v7/widget/aj;->b:Ljava/lang/CharSequence;

    invoke-virtual {p1}, Landroid/support/v7/widget/Toolbar;->getSubtitle()Ljava/lang/CharSequence;

    move-result-object v1

    iput-object v1, p0, Landroid/support/v7/widget/aj;->k:Ljava/lang/CharSequence;

    iget-object v1, p0, Landroid/support/v7/widget/aj;->b:Ljava/lang/CharSequence;

    const/4 v2, 0x1

    if-eqz v1, :cond_0

    const/4 v1, 0x1

    goto :goto_0

    :cond_0
    const/4 v1, 0x0

    :goto_0
    iput-boolean v1, p0, Landroid/support/v7/widget/aj;->j:Z

    invoke-virtual {p1}, Landroid/support/v7/widget/Toolbar;->getNavigationIcon()Landroid/graphics/drawable/Drawable;

    move-result-object v1

    iput-object v1, p0, Landroid/support/v7/widget/aj;->i:Landroid/graphics/drawable/Drawable;

    invoke-virtual {p1}, Landroid/support/v7/widget/Toolbar;->getContext()Landroid/content/Context;

    move-result-object p1

    sget-object v1, Landroid/support/v7/a/a$j;->ActionBar:[I

    sget v3, Landroid/support/v7/a/a$a;->actionBarStyle:I

    const/4 v4, 0x0

    invoke-static {p1, v4, v1, v3, v0}, Landroid/support/v7/widget/ai;->a(Landroid/content/Context;Landroid/util/AttributeSet;[III)Landroid/support/v7/widget/ai;

    move-result-object p1

    sget v1, Landroid/support/v7/a/a$j;->ActionBar_homeAsUpIndicator:I

    invoke-virtual {p1, v1}, Landroid/support/v7/widget/ai;->a(I)Landroid/graphics/drawable/Drawable;

    move-result-object v1

    iput-object v1, p0, Landroid/support/v7/widget/aj;->o:Landroid/graphics/drawable/Drawable;

    sget v1, Landroid/support/v7/a/a$j;->ActionBar_title:I

    invoke-virtual {p1, v1}, Landroid/support/v7/widget/ai;->b(I)Ljava/lang/CharSequence;

    move-result-object v1

    invoke-static {v1}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v3

    if-nez v3, :cond_1

    iput-boolean v2, p0, Landroid/support/v7/widget/aj;->j:Z

    invoke-direct {p0, v1}, Landroid/support/v7/widget/aj;->b(Ljava/lang/CharSequence;)V

    :cond_1
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_subtitle:I

    invoke-virtual {p1, v1}, Landroid/support/v7/widget/ai;->b(I)Ljava/lang/CharSequence;

    move-result-object v1

    invoke-static {v1}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v2

    if-nez v2, :cond_2

    iput-object v1, p0, Landroid/support/v7/widget/aj;->k:Ljava/lang/CharSequence;

    iget v2, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v2, v2, 0x8

    if-eqz v2, :cond_2

    iget-object v2, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v2, v1}, Landroid/support/v7/widget/Toolbar;->setSubtitle(Ljava/lang/CharSequence;)V

    :cond_2
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_logo:I

    invoke-virtual {p1, v1}, Landroid/support/v7/widget/ai;->a(I)Landroid/graphics/drawable/Drawable;

    move-result-object v1

    if-eqz v1, :cond_3

    invoke-direct {p0, v1}, Landroid/support/v7/widget/aj;->b(Landroid/graphics/drawable/Drawable;)V

    :cond_3
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_icon:I

    invoke-virtual {p1, v1}, Landroid/support/v7/widget/ai;->a(I)Landroid/graphics/drawable/Drawable;

    move-result-object v1

    if-eqz v1, :cond_4

    invoke-virtual {p0, v1}, Landroid/support/v7/widget/aj;->a(Landroid/graphics/drawable/Drawable;)V

    :cond_4
    iget-object v1, p0, Landroid/support/v7/widget/aj;->i:Landroid/graphics/drawable/Drawable;

    if-nez v1, :cond_5

    iget-object v1, p0, Landroid/support/v7/widget/aj;->o:Landroid/graphics/drawable/Drawable;

    if-eqz v1, :cond_5

    iput-object v1, p0, Landroid/support/v7/widget/aj;->i:Landroid/graphics/drawable/Drawable;

    invoke-direct {p0}, Landroid/support/v7/widget/aj;->c()V

    :cond_5
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_displayOptions:I

    invoke-virtual {p1, v1, v0}, Landroid/support/v7/widget/ai;->a(II)I

    move-result v1

    invoke-direct {p0, v1}, Landroid/support/v7/widget/aj;->c(I)V

    sget v1, Landroid/support/v7/a/a$j;->ActionBar_customNavigationLayout:I

    invoke-virtual {p1, v1, v0}, Landroid/support/v7/widget/ai;->g(II)I

    move-result v1

    if-eqz v1, :cond_8

    iget-object v2, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v2}, Landroid/support/v7/widget/Toolbar;->getContext()Landroid/content/Context;

    move-result-object v2

    invoke-static {v2}, Landroid/view/LayoutInflater;->from(Landroid/content/Context;)Landroid/view/LayoutInflater;

    move-result-object v2

    iget-object v3, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v2, v1, v3, v0}, Landroid/view/LayoutInflater;->inflate(ILandroid/view/ViewGroup;Z)Landroid/view/View;

    move-result-object v1

    iget-object v2, p0, Landroid/support/v7/widget/aj;->f:Landroid/view/View;

    if-eqz v2, :cond_6

    iget v3, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v3, v3, 0x10

    if-eqz v3, :cond_6

    iget-object v3, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v3, v2}, Landroid/support/v7/widget/Toolbar;->removeView(Landroid/view/View;)V

    :cond_6
    iput-object v1, p0, Landroid/support/v7/widget/aj;->f:Landroid/view/View;

    if-eqz v1, :cond_7

    iget v1, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v1, v1, 0x10

    if-eqz v1, :cond_7

    iget-object v1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    iget-object v2, p0, Landroid/support/v7/widget/aj;->f:Landroid/view/View;

    invoke-virtual {v1, v2}, Landroid/support/v7/widget/Toolbar;->addView(Landroid/view/View;)V

    :cond_7
    iget v1, p0, Landroid/support/v7/widget/aj;->e:I

    or-int/lit8 v1, v1, 0x10

    invoke-direct {p0, v1}, Landroid/support/v7/widget/aj;->c(I)V

    :cond_8
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_height:I

    invoke-virtual {p1, v1, v0}, Landroid/support/v7/widget/ai;->f(II)I

    move-result v1

    if-lez v1, :cond_9

    iget-object v2, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v2}, Landroid/support/v7/widget/Toolbar;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v2

    iput v1, v2, Landroid/view/ViewGroup$LayoutParams;->height:I

    iget-object v1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v1, v2}, Landroid/support/v7/widget/Toolbar;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    :cond_9
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_contentInsetStart:I

    const/4 v2, -0x1

    invoke-virtual {p1, v1, v2}, Landroid/support/v7/widget/ai;->d(II)I

    move-result v1

    sget v3, Landroid/support/v7/a/a$j;->ActionBar_contentInsetEnd:I

    invoke-virtual {p1, v3, v2}, Landroid/support/v7/widget/ai;->d(II)I

    move-result v2

    if-gez v1, :cond_a

    if-ltz v2, :cond_b

    :cond_a
    iget-object v3, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-static {v1, v0}, Ljava/lang/Math;->max(II)I

    move-result v1

    invoke-static {v2, v0}, Ljava/lang/Math;->max(II)I

    move-result v2

    invoke-virtual {v3}, Landroid/support/v7/widget/Toolbar;->c()V

    iget-object v3, v3, Landroid/support/v7/widget/Toolbar;->k:Landroid/support/v7/widget/ab;

    invoke-virtual {v3, v1, v2}, Landroid/support/v7/widget/ab;->a(II)V

    :cond_b
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_titleTextStyle:I

    invoke-virtual {p1, v1, v0}, Landroid/support/v7/widget/ai;->g(II)I

    move-result v1

    if-eqz v1, :cond_c

    iget-object v2, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v2}, Landroid/support/v7/widget/Toolbar;->getContext()Landroid/content/Context;

    move-result-object v3

    iput v1, v2, Landroid/support/v7/widget/Toolbar;->h:I

    iget-object v5, v2, Landroid/support/v7/widget/Toolbar;->b:Landroid/widget/TextView;

    if-eqz v5, :cond_c

    iget-object v2, v2, Landroid/support/v7/widget/Toolbar;->b:Landroid/widget/TextView;

    invoke-virtual {v2, v3, v1}, Landroid/widget/TextView;->setTextAppearance(Landroid/content/Context;I)V

    :cond_c
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_subtitleTextStyle:I

    invoke-virtual {p1, v1, v0}, Landroid/support/v7/widget/ai;->g(II)I

    move-result v1

    if-eqz v1, :cond_d

    iget-object v2, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v2}, Landroid/support/v7/widget/Toolbar;->getContext()Landroid/content/Context;

    move-result-object v3

    iput v1, v2, Landroid/support/v7/widget/Toolbar;->i:I

    iget-object v5, v2, Landroid/support/v7/widget/Toolbar;->c:Landroid/widget/TextView;

    if-eqz v5, :cond_d

    iget-object v2, v2, Landroid/support/v7/widget/Toolbar;->c:Landroid/widget/TextView;

    invoke-virtual {v2, v3, v1}, Landroid/widget/TextView;->setTextAppearance(Landroid/content/Context;I)V

    :cond_d
    sget v1, Landroid/support/v7/a/a$j;->ActionBar_popupTheme:I

    invoke-virtual {p1, v1, v0}, Landroid/support/v7/widget/ai;->g(II)I

    move-result v0

    if-eqz v0, :cond_e

    iget-object v1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v1, v0}, Landroid/support/v7/widget/Toolbar;->setPopupTheme(I)V

    :cond_e
    iget-object p1, p1, Landroid/support/v7/widget/ai;->a:Landroid/content/res/TypedArray;

    invoke-virtual {p1}, Landroid/content/res/TypedArray;->recycle()V

    iget p1, p0, Landroid/support/v7/widget/aj;->n:I

    if-eq p2, p1, :cond_10

    iput p2, p0, Landroid/support/v7/widget/aj;->n:I

    iget-object p1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {p1}, Landroid/support/v7/widget/Toolbar;->getNavigationContentDescription()Ljava/lang/CharSequence;

    move-result-object p1

    invoke-static {p1}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result p1

    if-eqz p1, :cond_10

    iget p1, p0, Landroid/support/v7/widget/aj;->n:I

    if-nez p1, :cond_f

    goto :goto_1

    :cond_f
    iget-object p2, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {p2}, Landroid/support/v7/widget/Toolbar;->getContext()Landroid/content/Context;

    move-result-object p2

    invoke-virtual {p2, p1}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v4

    :goto_1
    iput-object v4, p0, Landroid/support/v7/widget/aj;->l:Ljava/lang/CharSequence;

    invoke-direct {p0}, Landroid/support/v7/widget/aj;->d()V

    :cond_10
    iget-object p1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {p1}, Landroid/support/v7/widget/Toolbar;->getNavigationContentDescription()Ljava/lang/CharSequence;

    move-result-object p1

    iput-object p1, p0, Landroid/support/v7/widget/aj;->l:Ljava/lang/CharSequence;

    iget-object p1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    new-instance p2, Landroid/support/v7/widget/aj$1;

    invoke-direct {p2, p0}, Landroid/support/v7/widget/aj$1;-><init>(Landroid/support/v7/widget/aj;)V

    invoke-virtual {p1, p2}, Landroid/support/v7/widget/Toolbar;->setNavigationOnClickListener(Landroid/view/View$OnClickListener;)V

    return-void
.end method

.method private b()V
    .locals 2

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v1, v0, 0x2

    if-eqz v1, :cond_1

    and-int/lit8 v0, v0, 0x1

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/aj;->h:Landroid/graphics/drawable/Drawable;

    if-eqz v0, :cond_0

    goto :goto_0

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/aj;->g:Landroid/graphics/drawable/Drawable;

    goto :goto_0

    :cond_1
    const/4 v0, 0x0

    :goto_0
    iget-object v1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v1, v0}, Landroid/support/v7/widget/Toolbar;->setLogo(Landroid/graphics/drawable/Drawable;)V

    return-void
.end method

.method private b(Landroid/graphics/drawable/Drawable;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/aj;->h:Landroid/graphics/drawable/Drawable;

    invoke-direct {p0}, Landroid/support/v7/widget/aj;->b()V

    return-void
.end method

.method private b(Ljava/lang/CharSequence;)V
    .locals 1

    iput-object p1, p0, Landroid/support/v7/widget/aj;->b:Ljava/lang/CharSequence;

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v0, v0, 0x8

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v0, p1}, Landroid/support/v7/widget/Toolbar;->setTitle(Ljava/lang/CharSequence;)V

    :cond_0
    return-void
.end method

.method private c()V
    .locals 2

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v0, v0, 0x4

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    iget-object v1, p0, Landroid/support/v7/widget/aj;->i:Landroid/graphics/drawable/Drawable;

    if-eqz v1, :cond_0

    goto :goto_0

    :cond_0
    iget-object v1, p0, Landroid/support/v7/widget/aj;->o:Landroid/graphics/drawable/Drawable;

    :goto_0
    invoke-virtual {v0, v1}, Landroid/support/v7/widget/Toolbar;->setNavigationIcon(Landroid/graphics/drawable/Drawable;)V

    return-void

    :cond_1
    iget-object v0, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/support/v7/widget/Toolbar;->setNavigationIcon(Landroid/graphics/drawable/Drawable;)V

    return-void
.end method

.method private c(I)V
    .locals 3

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    xor-int/2addr v0, p1

    iput p1, p0, Landroid/support/v7/widget/aj;->e:I

    if-eqz v0, :cond_6

    and-int/lit8 v1, v0, 0x4

    if-eqz v1, :cond_1

    and-int/lit8 v1, p1, 0x4

    if-eqz v1, :cond_0

    invoke-direct {p0}, Landroid/support/v7/widget/aj;->d()V

    :cond_0
    invoke-direct {p0}, Landroid/support/v7/widget/aj;->c()V

    :cond_1
    and-int/lit8 v1, v0, 0x3

    if-eqz v1, :cond_2

    invoke-direct {p0}, Landroid/support/v7/widget/aj;->b()V

    :cond_2
    and-int/lit8 v1, v0, 0x8

    if-eqz v1, :cond_4

    and-int/lit8 v1, p1, 0x8

    if-eqz v1, :cond_3

    iget-object v1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    iget-object v2, p0, Landroid/support/v7/widget/aj;->b:Ljava/lang/CharSequence;

    invoke-virtual {v1, v2}, Landroid/support/v7/widget/Toolbar;->setTitle(Ljava/lang/CharSequence;)V

    iget-object v1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    iget-object v2, p0, Landroid/support/v7/widget/aj;->k:Ljava/lang/CharSequence;

    goto :goto_0

    :cond_3
    iget-object v1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    const/4 v2, 0x0

    invoke-virtual {v1, v2}, Landroid/support/v7/widget/Toolbar;->setTitle(Ljava/lang/CharSequence;)V

    iget-object v1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    :goto_0
    invoke-virtual {v1, v2}, Landroid/support/v7/widget/Toolbar;->setSubtitle(Ljava/lang/CharSequence;)V

    :cond_4
    and-int/lit8 v0, v0, 0x10

    if-eqz v0, :cond_6

    iget-object v0, p0, Landroid/support/v7/widget/aj;->f:Landroid/view/View;

    if-eqz v0, :cond_6

    and-int/lit8 p1, p1, 0x10

    if-eqz p1, :cond_5

    iget-object p1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/Toolbar;->addView(Landroid/view/View;)V

    return-void

    :cond_5
    iget-object p1, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/Toolbar;->removeView(Landroid/view/View;)V

    :cond_6
    return-void
.end method

.method private d()V
    .locals 2

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v0, v0, 0x4

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/widget/aj;->l:Ljava/lang/CharSequence;

    invoke-static {v0}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v0

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    iget v1, p0, Landroid/support/v7/widget/aj;->n:I

    invoke-virtual {v0, v1}, Landroid/support/v7/widget/Toolbar;->setNavigationContentDescription(I)V

    return-void

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    iget-object v1, p0, Landroid/support/v7/widget/aj;->l:Ljava/lang/CharSequence;

    invoke-virtual {v0, v1}, Landroid/support/v7/widget/Toolbar;->setNavigationContentDescription(Ljava/lang/CharSequence;)V

    :cond_1
    return-void
.end method


# virtual methods
.method public final a()Ljava/lang/CharSequence;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v0}, Landroid/support/v7/widget/Toolbar;->getTitle()Ljava/lang/CharSequence;

    move-result-object v0

    return-object v0
.end method

.method public final a(I)V
    .locals 1

    if-eqz p1, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v0}, Landroid/support/v7/widget/Toolbar;->getContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0, p1}, Landroid/support/v7/b/a/a;->b(Landroid/content/Context;I)Landroid/graphics/drawable/Drawable;

    move-result-object p1

    goto :goto_0

    :cond_0
    const/4 p1, 0x0

    :goto_0
    invoke-virtual {p0, p1}, Landroid/support/v7/widget/aj;->a(Landroid/graphics/drawable/Drawable;)V

    return-void
.end method

.method public final a(Landroid/graphics/drawable/Drawable;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/aj;->g:Landroid/graphics/drawable/Drawable;

    invoke-direct {p0}, Landroid/support/v7/widget/aj;->b()V

    return-void
.end method

.method public final a(Landroid/view/Window$Callback;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/aj;->c:Landroid/view/Window$Callback;

    return-void
.end method

.method public final a(Ljava/lang/CharSequence;)V
    .locals 1

    iget-boolean v0, p0, Landroid/support/v7/widget/aj;->j:Z

    if-nez v0, :cond_0

    invoke-direct {p0, p1}, Landroid/support/v7/widget/aj;->b(Ljava/lang/CharSequence;)V

    :cond_0
    return-void
.end method

.method public final b(I)V
    .locals 1

    if-eqz p1, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/aj;->a:Landroid/support/v7/widget/Toolbar;

    invoke-virtual {v0}, Landroid/support/v7/widget/Toolbar;->getContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0, p1}, Landroid/support/v7/b/a/a;->b(Landroid/content/Context;I)Landroid/graphics/drawable/Drawable;

    move-result-object p1

    goto :goto_0

    :cond_0
    const/4 p1, 0x0

    :goto_0
    invoke-direct {p0, p1}, Landroid/support/v7/widget/aj;->b(Landroid/graphics/drawable/Drawable;)V

    return-void
.end method
