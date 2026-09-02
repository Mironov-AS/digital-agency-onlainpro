.class final Landroid/support/b/a/i$g;
.super Landroid/graphics/drawable/Drawable$ConstantState;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/b/a/i;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x8
    name = "g"
.end annotation


# instance fields
.field a:I

.field b:Landroid/support/b/a/i$f;

.field c:Landroid/content/res/ColorStateList;

.field d:Landroid/graphics/PorterDuff$Mode;

.field e:Z

.field f:Landroid/graphics/Bitmap;

.field g:Landroid/content/res/ColorStateList;

.field h:Landroid/graphics/PorterDuff$Mode;

.field i:I

.field j:Z

.field k:Z

.field l:Landroid/graphics/Paint;


# direct methods
.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Landroid/graphics/drawable/Drawable$ConstantState;-><init>()V

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/b/a/i$g;->c:Landroid/content/res/ColorStateList;

    sget-object v0, Landroid/support/b/a/i;->a:Landroid/graphics/PorterDuff$Mode;

    iput-object v0, p0, Landroid/support/b/a/i$g;->d:Landroid/graphics/PorterDuff$Mode;

    new-instance v0, Landroid/support/b/a/i$f;

    invoke-direct {v0}, Landroid/support/b/a/i$f;-><init>()V

    iput-object v0, p0, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    return-void
.end method

.method public constructor <init>(Landroid/support/b/a/i$g;)V
    .locals 3

    invoke-direct {p0}, Landroid/graphics/drawable/Drawable$ConstantState;-><init>()V

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/b/a/i$g;->c:Landroid/content/res/ColorStateList;

    sget-object v0, Landroid/support/b/a/i;->a:Landroid/graphics/PorterDuff$Mode;

    iput-object v0, p0, Landroid/support/b/a/i$g;->d:Landroid/graphics/PorterDuff$Mode;

    if-eqz p1, :cond_2

    iget v0, p1, Landroid/support/b/a/i$g;->a:I

    iput v0, p0, Landroid/support/b/a/i$g;->a:I

    new-instance v0, Landroid/support/b/a/i$f;

    iget-object v1, p1, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    invoke-direct {v0, v1}, Landroid/support/b/a/i$f;-><init>(Landroid/support/b/a/i$f;)V

    iput-object v0, p0, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    iget-object v0, p1, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    iget-object v0, v0, Landroid/support/b/a/i$f;->b:Landroid/graphics/Paint;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    new-instance v1, Landroid/graphics/Paint;

    iget-object v2, p1, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    iget-object v2, v2, Landroid/support/b/a/i$f;->b:Landroid/graphics/Paint;

    invoke-direct {v1, v2}, Landroid/graphics/Paint;-><init>(Landroid/graphics/Paint;)V

    iput-object v1, v0, Landroid/support/b/a/i$f;->b:Landroid/graphics/Paint;

    :cond_0
    iget-object v0, p1, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    iget-object v0, v0, Landroid/support/b/a/i$f;->a:Landroid/graphics/Paint;

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    new-instance v1, Landroid/graphics/Paint;

    iget-object v2, p1, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    iget-object v2, v2, Landroid/support/b/a/i$f;->a:Landroid/graphics/Paint;

    invoke-direct {v1, v2}, Landroid/graphics/Paint;-><init>(Landroid/graphics/Paint;)V

    iput-object v1, v0, Landroid/support/b/a/i$f;->a:Landroid/graphics/Paint;

    :cond_1
    iget-object v0, p1, Landroid/support/b/a/i$g;->c:Landroid/content/res/ColorStateList;

    iput-object v0, p0, Landroid/support/b/a/i$g;->c:Landroid/content/res/ColorStateList;

    iget-object v0, p1, Landroid/support/b/a/i$g;->d:Landroid/graphics/PorterDuff$Mode;

    iput-object v0, p0, Landroid/support/b/a/i$g;->d:Landroid/graphics/PorterDuff$Mode;

    iget-boolean p1, p1, Landroid/support/b/a/i$g;->e:Z

    iput-boolean p1, p0, Landroid/support/b/a/i$g;->e:Z

    :cond_2
    return-void
.end method


# virtual methods
.method public final a(II)V
    .locals 2

    iget-object v0, p0, Landroid/support/b/a/i$g;->f:Landroid/graphics/Bitmap;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/graphics/Bitmap;->eraseColor(I)V

    new-instance v0, Landroid/graphics/Canvas;

    iget-object v1, p0, Landroid/support/b/a/i$g;->f:Landroid/graphics/Bitmap;

    invoke-direct {v0, v1}, Landroid/graphics/Canvas;-><init>(Landroid/graphics/Bitmap;)V

    iget-object v1, p0, Landroid/support/b/a/i$g;->b:Landroid/support/b/a/i$f;

    invoke-virtual {v1, v0, p1, p2}, Landroid/support/b/a/i$f;->a(Landroid/graphics/Canvas;II)V

    return-void
.end method

.method public final getChangingConfigurations()I
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$g;->a:I

    return v0
.end method

.method public final newDrawable()Landroid/graphics/drawable/Drawable;
    .locals 1

    new-instance v0, Landroid/support/b/a/i;

    invoke-direct {v0, p0}, Landroid/support/b/a/i;-><init>(Landroid/support/b/a/i$g;)V

    return-object v0
.end method

.method public final newDrawable(Landroid/content/res/Resources;)Landroid/graphics/drawable/Drawable;
    .locals 0

    new-instance p1, Landroid/support/b/a/i;

    invoke-direct {p1, p0}, Landroid/support/b/a/i;-><init>(Landroid/support/b/a/i$g;)V

    return-object p1
.end method
