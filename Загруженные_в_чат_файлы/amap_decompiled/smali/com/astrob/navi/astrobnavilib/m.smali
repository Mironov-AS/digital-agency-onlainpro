.class public final Lcom/astrob/navi/astrobnavilib/m;
.super Ljava/lang/Object;


# static fields
.field public static final a:[Ljava/lang/String;


# direct methods
.method static constructor <clinit>()V
    .locals 3

    const/16 v0, 0xb

    new-array v0, v0, [Ljava/lang/String;

    const-string v1, "/sdcard"

    const/4 v2, 0x0

    aput-object v1, v0, v2

    const-string v1, "/sdcard/external_sd"

    const/4 v2, 0x1

    aput-object v1, v0, v2

    const-string v1, "/mnt/sdcard"

    const/4 v2, 0x2

    aput-object v1, v0, v2

    const-string v1, "/sdcard-ext"

    const/4 v2, 0x3

    aput-object v1, v0, v2

    const-string v1, "/mnt/sdcard-ext"

    const/4 v2, 0x4

    aput-object v1, v0, v2

    const-string v1, "/sdcard/removable_sdcard"

    const/4 v2, 0x5

    aput-object v1, v0, v2

    const-string v1, "/flash"

    const/4 v2, 0x6

    aput-object v1, v0, v2

    const-string v1, "/nand"

    const/4 v2, 0x7

    aput-object v1, v0, v2

    const-string v1, "/mnt/sdnavi"

    const/16 v2, 0x8

    aput-object v1, v0, v2

    const-string v1, "/mnt/extsd"

    const/16 v2, 0x9

    aput-object v1, v0, v2

    const-string v1, "/navi_map"

    const/16 v2, 0xa

    aput-object v1, v0, v2

    sput-object v0, Lcom/astrob/navi/astrobnavilib/m;->a:[Ljava/lang/String;

    return-void
.end method

.method public static a(Ljava/lang/String;)Z
    .locals 0

    if-eqz p0, :cond_1

    invoke-virtual {p0}, Ljava/lang/String;->length()I

    move-result p0

    if-nez p0, :cond_0

    goto :goto_0

    :cond_0
    const/4 p0, 0x0

    return p0

    :cond_1
    :goto_0
    const/4 p0, 0x1

    return p0
.end method

.method public static b(Ljava/lang/String;)J
    .locals 5
    .annotation build Landroid/annotation/SuppressLint;
        value = {
            "NewApi"
        }
    .end annotation

    invoke-static {p0}, Lcom/astrob/navi/astrobnavilib/m;->a(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_0

    const-wide/16 v0, 0x0

    return-wide v0

    :cond_0
    new-instance v0, Landroid/os/StatFs;

    invoke-direct {v0, p0}, Landroid/os/StatFs;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0}, Landroid/os/StatFs;->getBlockSize()I

    move-result p0

    int-to-long v1, p0

    invoke-virtual {v0}, Landroid/os/StatFs;->getAvailableBlocks()I

    move-result p0

    int-to-long v3, p0

    mul-long v1, v1, v3

    return-wide v1
.end method
