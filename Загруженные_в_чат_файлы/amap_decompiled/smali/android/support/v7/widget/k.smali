.class public final Landroid/support/v7/widget/k;
.super Ljava/lang/Object;


# instance fields
.field private final a:Landroid/widget/ImageView;

.field private b:Landroid/support/v7/widget/ag;

.field private c:Landroid/support/v7/widget/ag;

.field private d:Landroid/support/v7/widget/ag;


# direct methods
.method public constructor <init>(Landroid/widget/ImageView;)V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p1, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    return-void
.end method

.method private a(Landroid/graphics/drawable/Drawable;)Z
    .locals 3

    iget-object v0, p0, Landroid/support/v7/widget/k;->d:Landroid/support/v7/widget/ag;

    if-nez v0, :cond_0

    new-instance v0, Landroid/support/v7/widget/ag;

    invoke-direct {v0}, Landroid/support/v7/widget/ag;-><init>()V

    iput-object v0, p0, Landroid/support/v7/widget/k;->d:Landroid/support/v7/widget/ag;

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/k;->d:Landroid/support/v7/widget/ag;

    invoke-virtual {v0}, Landroid/support/v7/widget/ag;->a()V

    iget-object v1, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-static {v1}, Landroid/support/v4/widget/f;->a(Landroid/widget/ImageView;)Landroid/content/res/ColorStateList;

    move-result-object v1

    const/4 v2, 0x1

    if-eqz v1, :cond_1

    iput-boolean v2, v0, Landroid/support/v7/widget/ag;->d:Z

    iput-object v1, v0, Landroid/support/v7/widget/ag;->a:Landroid/content/res/ColorStateList;

    :cond_1
    iget-object v1, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-static {v1}, Landroid/support/v4/widget/f;->b(Landroid/widget/ImageView;)Landroid/graphics/PorterDuff$Mode;

    move-result-object v1

    if-eqz v1, :cond_2

    iput-boolean v2, v0, Landroid/support/v7/widget/ag;->c:Z

    iput-object v1, v0, Landroid/support/v7/widget/ag;->b:Landroid/graphics/PorterDuff$Mode;

    :cond_2
    iget-boolean v1, v0, Landroid/support/v7/widget/ag;->d:Z

    if-nez v1, :cond_4

    iget-boolean v1, v0, Landroid/support/v7/widget/ag;->c:Z

    if-eqz v1, :cond_3

    goto :goto_0

    :cond_3
    const/4 p1, 0x0

    return p1

    :cond_4
    :goto_0
    iget-object v1, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v1}, Landroid/widget/ImageView;->getDrawableState()[I

    move-result-object v1

    invoke-static {p1, v0, v1}, Landroid/support/v7/widget/g;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/ag;[I)V

    return v2
.end method

.method private e()Z
    .locals 4

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/4 v1, 0x1

    const/4 v2, 0x0

    const/16 v3, 0x15

    if-le v0, v3, :cond_1

    iget-object v0, p0, Landroid/support/v7/widget/k;->b:Landroid/support/v7/widget/ag;

    if-eqz v0, :cond_0

    return v1

    :cond_0
    return v2

    :cond_1
    if-ne v0, v3, :cond_2

    return v1

    :cond_2
    return v2
.end method


# virtual methods
.method public final a(I)V
    .locals 4

    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v0}, Landroid/widget/ImageView;->getContext()Landroid/content/Context;

    move-result-object v0

    sget-object v1, Landroid/support/v7/a/a$j;->AppCompatImageView:[I

    const/4 v2, 0x0

    const/4 v3, 0x0

    invoke-static {v0, v2, v1, p1, v3}, Landroid/support/v7/widget/ai;->a(Landroid/content/Context;Landroid/util/AttributeSet;[III)Landroid/support/v7/widget/ai;

    move-result-object p1

    :try_start_0
    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v0}, Landroid/widget/ImageView;->getDrawable()Landroid/graphics/drawable/Drawable;

    move-result-object v0

    const/4 v1, -0x1

    if-nez v0, :cond_0

    sget v3, Landroid/support/v7/a/a$j;->AppCompatImageView_srcCompat:I

    invoke-virtual {p1, v3, v1}, Landroid/support/v7/widget/ai;->g(II)I

    move-result v3

    if-eq v3, v1, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v0}, Landroid/widget/ImageView;->getContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0, v3}, Landroid/support/v7/b/a/a;->b(Landroid/content/Context;I)Landroid/graphics/drawable/Drawable;

    move-result-object v0

    if-eqz v0, :cond_0

    iget-object v3, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v3, v0}, Landroid/widget/ImageView;->setImageDrawable(Landroid/graphics/drawable/Drawable;)V

    :cond_0
    if-eqz v0, :cond_1

    invoke-static {v0}, Landroid/support/v7/widget/s;->a(Landroid/graphics/drawable/Drawable;)V

    :cond_1
    sget v0, Landroid/support/v7/a/a$j;->AppCompatImageView_tint:I

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ai;->e(I)Z

    move-result v0

    if-eqz v0, :cond_2

    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    sget v3, Landroid/support/v7/a/a$j;->AppCompatImageView_tint:I

    invoke-virtual {p1, v3}, Landroid/support/v7/widget/ai;->d(I)Landroid/content/res/ColorStateList;

    move-result-object v3

    invoke-static {v0, v3}, Landroid/support/v4/widget/f;->a(Landroid/widget/ImageView;Landroid/content/res/ColorStateList;)V

    :cond_2
    sget v0, Landroid/support/v7/a/a$j;->AppCompatImageView_tintMode:I

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ai;->e(I)Z

    move-result v0

    if-eqz v0, :cond_3

    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    sget v3, Landroid/support/v7/a/a$j;->AppCompatImageView_tintMode:I

    invoke-virtual {p1, v3, v1}, Landroid/support/v7/widget/ai;->a(II)I

    move-result v1

    invoke-static {v1, v2}, Landroid/support/v7/widget/s;->a(ILandroid/graphics/PorterDuff$Mode;)Landroid/graphics/PorterDuff$Mode;

    move-result-object v1

    invoke-static {v0, v1}, Landroid/support/v4/widget/f;->a(Landroid/widget/ImageView;Landroid/graphics/PorterDuff$Mode;)V
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    :cond_3
    iget-object p1, p1, Landroid/support/v7/widget/ai;->a:Landroid/content/res/TypedArray;

    invoke-virtual {p1}, Landroid/content/res/TypedArray;->recycle()V

    return-void

    :catchall_0
    move-exception v0

    iget-object p1, p1, Landroid/support/v7/widget/ai;->a:Landroid/content/res/TypedArray;

    invoke-virtual {p1}, Landroid/content/res/TypedArray;->recycle()V

    throw v0
.end method

.method final a(Landroid/content/res/ColorStateList;)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    if-nez v0, :cond_0

    new-instance v0, Landroid/support/v7/widget/ag;

    invoke-direct {v0}, Landroid/support/v7/widget/ag;-><init>()V

    iput-object v0, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    iput-object p1, v0, Landroid/support/v7/widget/ag;->a:Landroid/content/res/ColorStateList;

    const/4 p1, 0x1

    iput-boolean p1, v0, Landroid/support/v7/widget/ag;->d:Z

    invoke-virtual {p0}, Landroid/support/v7/widget/k;->d()V

    return-void
.end method

.method final a(Landroid/graphics/PorterDuff$Mode;)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    if-nez v0, :cond_0

    new-instance v0, Landroid/support/v7/widget/ag;

    invoke-direct {v0}, Landroid/support/v7/widget/ag;-><init>()V

    iput-object v0, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    iput-object p1, v0, Landroid/support/v7/widget/ag;->b:Landroid/graphics/PorterDuff$Mode;

    const/4 p1, 0x1

    iput-boolean p1, v0, Landroid/support/v7/widget/ag;->c:Z

    invoke-virtual {p0}, Landroid/support/v7/widget/k;->d()V

    return-void
.end method

.method final a()Z
    .locals 3

    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v0}, Landroid/widget/ImageView;->getBackground()Landroid/graphics/drawable/Drawable;

    move-result-object v0

    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v2, 0x15

    if-lt v1, v2, :cond_0

    instance-of v0, v0, Landroid/graphics/drawable/RippleDrawable;

    if-eqz v0, :cond_0

    const/4 v0, 0x0

    return v0

    :cond_0
    const/4 v0, 0x1

    return v0
.end method

.method final b()Landroid/content/res/ColorStateList;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    if-eqz v0, :cond_0

    iget-object v0, v0, Landroid/support/v7/widget/ag;->a:Landroid/content/res/ColorStateList;

    return-object v0

    :cond_0
    const/4 v0, 0x0

    return-object v0
.end method

.method public final b(I)V
    .locals 1

    if-eqz p1, :cond_1

    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v0}, Landroid/widget/ImageView;->getContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0, p1}, Landroid/support/v7/b/a/a;->b(Landroid/content/Context;I)Landroid/graphics/drawable/Drawable;

    move-result-object p1

    if-eqz p1, :cond_0

    invoke-static {p1}, Landroid/support/v7/widget/s;->a(Landroid/graphics/drawable/Drawable;)V

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v0, p1}, Landroid/widget/ImageView;->setImageDrawable(Landroid/graphics/drawable/Drawable;)V

    goto :goto_0

    :cond_1
    iget-object p1, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    const/4 v0, 0x0

    invoke-virtual {p1, v0}, Landroid/widget/ImageView;->setImageDrawable(Landroid/graphics/drawable/Drawable;)V

    :goto_0
    invoke-virtual {p0}, Landroid/support/v7/widget/k;->d()V

    return-void
.end method

.method final c()Landroid/graphics/PorterDuff$Mode;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    if-eqz v0, :cond_0

    iget-object v0, v0, Landroid/support/v7/widget/ag;->b:Landroid/graphics/PorterDuff$Mode;

    return-object v0

    :cond_0
    const/4 v0, 0x0

    return-object v0
.end method

.method final d()V
    .locals 3

    iget-object v0, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v0}, Landroid/widget/ImageView;->getDrawable()Landroid/graphics/drawable/Drawable;

    move-result-object v0

    if-eqz v0, :cond_0

    invoke-static {v0}, Landroid/support/v7/widget/s;->a(Landroid/graphics/drawable/Drawable;)V

    :cond_0
    if-eqz v0, :cond_3

    invoke-direct {p0}, Landroid/support/v7/widget/k;->e()Z

    move-result v1

    if-eqz v1, :cond_1

    invoke-direct {p0, v0}, Landroid/support/v7/widget/k;->a(Landroid/graphics/drawable/Drawable;)Z

    move-result v1

    if-eqz v1, :cond_1

    return-void

    :cond_1
    iget-object v1, p0, Landroid/support/v7/widget/k;->c:Landroid/support/v7/widget/ag;

    if-eqz v1, :cond_2

    iget-object v2, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v2}, Landroid/widget/ImageView;->getDrawableState()[I

    move-result-object v2

    invoke-static {v0, v1, v2}, Landroid/support/v7/widget/g;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/ag;[I)V

    return-void

    :cond_2
    iget-object v1, p0, Landroid/support/v7/widget/k;->b:Landroid/support/v7/widget/ag;

    if-eqz v1, :cond_3

    iget-object v2, p0, Landroid/support/v7/widget/k;->a:Landroid/widget/ImageView;

    invoke-virtual {v2}, Landroid/widget/ImageView;->getDrawableState()[I

    move-result-object v2

    invoke-static {v0, v1, v2}, Landroid/support/v7/widget/g;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/ag;[I)V

    :cond_3
    return-void
.end method
