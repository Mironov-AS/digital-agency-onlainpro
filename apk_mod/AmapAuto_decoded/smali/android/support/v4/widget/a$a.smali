.class final Landroid/support/v4/widget/a$a;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v4/widget/a;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x8
    name = "a"
.end annotation


# instance fields
.field a:I

.field b:I

.field c:F

.field d:F

.field e:J

.field f:J

.field g:I

.field h:I

.field i:J

.field j:F

.field k:I


# direct methods
.method constructor <init>()V
    .locals 2

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const-wide/high16 v0, -0x8000000000000000L

    iput-wide v0, p0, Landroid/support/v4/widget/a$a;->e:J

    const-wide/16 v0, -0x1

    iput-wide v0, p0, Landroid/support/v4/widget/a$a;->i:J

    const-wide/16 v0, 0x0

    iput-wide v0, p0, Landroid/support/v4/widget/a$a;->f:J

    const/4 v0, 0x0

    iput v0, p0, Landroid/support/v4/widget/a$a;->g:I

    iput v0, p0, Landroid/support/v4/widget/a$a;->h:I

    return-void
.end method


# virtual methods
.method final a(J)F
    .locals 7

    iget-wide v0, p0, Landroid/support/v4/widget/a$a;->e:J

    const/4 v2, 0x0

    cmp-long v3, p1, v0

    if-gez v3, :cond_0

    return v2

    :cond_0
    iget-wide v0, p0, Landroid/support/v4/widget/a$a;->i:J

    const-wide/16 v3, 0x0

    const/high16 v5, 0x3f800000    # 1.0f

    cmp-long v6, v0, v3

    if-ltz v6, :cond_2

    cmp-long v3, p1, v0

    if-gez v3, :cond_1

    goto :goto_0

    :cond_1
    sub-long/2addr p1, v0

    iget v0, p0, Landroid/support/v4/widget/a$a;->j:F

    sub-float v1, v5, v0

    long-to-float p1, p1

    iget p2, p0, Landroid/support/v4/widget/a$a;->k:I

    int-to-float p2, p2

    div-float/2addr p1, p2

    invoke-static {p1, v2, v5}, Landroid/support/v4/widget/a;->a(FFF)F

    move-result p1

    mul-float v0, v0, p1

    add-float/2addr v1, v0

    return v1

    :cond_2
    :goto_0
    iget-wide v0, p0, Landroid/support/v4/widget/a$a;->e:J

    sub-long/2addr p1, v0

    const/high16 v0, 0x3f000000    # 0.5f

    long-to-float p1, p1

    iget p2, p0, Landroid/support/v4/widget/a$a;->a:I

    int-to-float p2, p2

    div-float/2addr p1, p2

    invoke-static {p1, v2, v5}, Landroid/support/v4/widget/a;->a(FFF)F

    move-result p1

    mul-float p1, p1, v0

    return p1
.end method

.method public final a()V
    .locals 4

    invoke-static {}, Landroid/view/animation/AnimationUtils;->currentAnimationTimeMillis()J

    move-result-wide v0

    iget-wide v2, p0, Landroid/support/v4/widget/a$a;->e:J

    sub-long v2, v0, v2

    long-to-int v3, v2

    iget v2, p0, Landroid/support/v4/widget/a$a;->b:I

    invoke-static {v3, v2}, Landroid/support/v4/widget/a;->a(II)I

    move-result v2

    iput v2, p0, Landroid/support/v4/widget/a$a;->k:I

    invoke-virtual {p0, v0, v1}, Landroid/support/v4/widget/a$a;->a(J)F

    move-result v2

    iput v2, p0, Landroid/support/v4/widget/a$a;->j:F

    iput-wide v0, p0, Landroid/support/v4/widget/a$a;->i:J

    return-void
.end method

.method public final b()I
    .locals 2

    iget v0, p0, Landroid/support/v4/widget/a$a;->c:F

    invoke-static {v0}, Ljava/lang/Math;->abs(F)F

    move-result v1

    div-float/2addr v0, v1

    float-to-int v0, v0

    return v0
.end method

.method public final c()I
    .locals 2

    iget v0, p0, Landroid/support/v4/widget/a$a;->d:F

    invoke-static {v0}, Ljava/lang/Math;->abs(F)F

    move-result v1

    div-float/2addr v0, v1

    float-to-int v0, v0

    return v0
.end method
