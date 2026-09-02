.class final Landroid/support/v7/widget/t$b;
.super Ljava/lang/Object;

# interfaces
.implements Ljava/lang/Runnable;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v7/widget/t;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = "b"
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/widget/t;


# direct methods
.method constructor <init>(Landroid/support/v7/widget/t;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/t$b;->a:Landroid/support/v7/widget/t;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public final run()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/widget/t$b;->a:Landroid/support/v7/widget/t;

    const/4 v1, 0x0

    iput-object v1, v0, Landroid/support/v7/widget/t;->a:Landroid/support/v7/widget/t$b;

    invoke-virtual {v0}, Landroid/support/v7/widget/t;->drawableStateChanged()V

    return-void
.end method
