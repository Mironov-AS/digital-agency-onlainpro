.class public Lcom/astrob/navi/astrobnavilib/k;
.super Ljava/lang/Object;


# static fields
.field private static b:Lcom/astrob/navi/astrobnavilib/k;


# instance fields
.field public a:Lcom/astrob/navi/astrobnavilib/j;


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    return-void
.end method

.method public static a()Lcom/astrob/navi/astrobnavilib/k;
    .locals 2

    const-class v0, Lcom/astrob/navi/astrobnavilib/k;

    monitor-enter v0

    :try_start_0
    sget-object v1, Lcom/astrob/navi/astrobnavilib/k;->b:Lcom/astrob/navi/astrobnavilib/k;

    if-nez v1, :cond_0

    new-instance v1, Lcom/astrob/navi/astrobnavilib/k;

    invoke-direct {v1}, Lcom/astrob/navi/astrobnavilib/k;-><init>()V

    sput-object v1, Lcom/astrob/navi/astrobnavilib/k;->b:Lcom/astrob/navi/astrobnavilib/k;

    :cond_0
    monitor-exit v0
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    sget-object v0, Lcom/astrob/navi/astrobnavilib/k;->b:Lcom/astrob/navi/astrobnavilib/k;

    return-object v0

    :catchall_0
    move-exception v1

    :try_start_1
    monitor-exit v0
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    throw v1
.end method
