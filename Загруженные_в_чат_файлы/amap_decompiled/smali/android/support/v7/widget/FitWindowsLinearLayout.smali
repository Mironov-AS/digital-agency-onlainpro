.class public Landroid/support/v7/widget/FitWindowsLinearLayout;
.super Landroid/widget/LinearLayout;

# interfaces
.implements Landroid/support/v7/widget/u;


# instance fields
.field private a:Landroid/support/v7/widget/u$a;


# direct methods
.method public constructor <init>(Landroid/content/Context;Landroid/util/AttributeSet;)V
    .locals 0

    invoke-direct {p0, p1, p2}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;)V

    return-void
.end method


# virtual methods
.method protected fitSystemWindows(Landroid/graphics/Rect;)Z
    .locals 0

    invoke-super {p0, p1}, Landroid/widget/LinearLayout;->fitSystemWindows(Landroid/graphics/Rect;)Z

    move-result p1

    return p1
.end method

.method public setOnFitSystemWindowsListener(Landroid/support/v7/widget/u$a;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/FitWindowsLinearLayout;->a:Landroid/support/v7/widget/u$a;

    return-void
.end method
