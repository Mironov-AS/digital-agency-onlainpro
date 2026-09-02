.class public Lcom/astrob/navi/astrobnavilib/c;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/astrob/navi/astrobnavilib/c$a;
    }
.end annotation


# static fields
.field public static volatile a:Z = false

.field private static b:Landroid/location/LocationManager; = null

.field private static c:I = 0x0

.field private static d:[B = null

.field private static e:I = 0x200

.field private static f:Lorg/json/JSONObject; = null

.field private static g:J = 0x0L

.field private static h:Z = true

.field private static i:Z = false

.field private static j:Landroid/content/Context;

.field private static final k:Ljava/lang/String;

.field private static l:Z

.field private static m:Lcom/astrob/navi/astrobnavilib/c$a;

.field private static final n:Landroid/location/LocationListener;

.field private static final o:Landroid/location/GpsStatus$Listener;


# direct methods
.method static constructor <clinit>()V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "TB9"

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    const-class v1, Lcom/astrob/navi/astrobnavilib/c;

    invoke-virtual {v1}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    sput-object v0, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    const/4 v0, 0x0

    sput-boolean v0, Lcom/astrob/navi/astrobnavilib/c;->l:Z

    const/4 v0, 0x0

    sput-object v0, Lcom/astrob/navi/astrobnavilib/c;->m:Lcom/astrob/navi/astrobnavilib/c$a;

    new-instance v0, Lcom/astrob/navi/astrobnavilib/c$1;

    invoke-direct {v0}, Lcom/astrob/navi/astrobnavilib/c$1;-><init>()V

    sput-object v0, Lcom/astrob/navi/astrobnavilib/c;->n:Landroid/location/LocationListener;

    new-instance v0, Lcom/astrob/navi/astrobnavilib/c$2;

    invoke-direct {v0}, Lcom/astrob/navi/astrobnavilib/c$2;-><init>()V

    sput-object v0, Lcom/astrob/navi/astrobnavilib/c;->o:Landroid/location/GpsStatus$Listener;

    return-void
.end method

.method public constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method static synthetic a(J)J
    .locals 0

    sput-wide p0, Lcom/astrob/navi/astrobnavilib/c;->g:J

    return-wide p0
.end method

.method public static a()V
    .locals 2

    const/4 v0, 0x1

    sput-boolean v0, Lcom/astrob/navi/astrobnavilib/c;->a:Z

    sget-boolean v0, Lcom/astrob/navi/astrobnavilib/c;->l:Z

    if-eqz v0, :cond_0

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->m:Lcom/astrob/navi/astrobnavilib/c$a;

    if-eqz v0, :cond_1

    iget-object v1, v0, Lcom/astrob/navi/astrobnavilib/c$a;->a:Landroid/os/Looper;

    if-eqz v1, :cond_0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/c$a;->a:Landroid/os/Looper;

    invoke-virtual {v0}, Landroid/os/Looper;->quit()V

    :cond_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->j()V

    :cond_1
    const/4 v0, 0x0

    sput v0, Lcom/astrob/navi/astrobnavilib/c;->c:I

    const/4 v1, 0x0

    sput-object v1, Lcom/astrob/navi/astrobnavilib/c;->j:Landroid/content/Context;

    sput-boolean v0, Lcom/astrob/navi/astrobnavilib/c;->i:Z

    return-void
.end method

.method public static a(I)V
    .locals 3

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    const-string v1, "Jni call StartGPS, nType="

    invoke-static {p0}, Ljava/lang/String;->valueOf(I)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    sput p0, Lcom/astrob/navi/astrobnavilib/c;->c:I

    return-void
.end method

.method public static a(Landroid/content/Context;)V
    .locals 5

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    const-string v1, "StartGPS"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    if-eqz p0, :cond_6

    sget-boolean v0, Lcom/astrob/navi/astrobnavilib/c;->i:Z

    if-eqz v0, :cond_0

    goto/16 :goto_1

    :cond_0
    sput-object p0, Lcom/astrob/navi/astrobnavilib/c;->j:Landroid/content/Context;

    const/4 v0, 0x0

    sput-boolean v0, Lcom/astrob/navi/astrobnavilib/c;->a:Z

    const/4 v1, 0x1

    sput-boolean v1, Lcom/astrob/navi/astrobnavilib/c;->h:Z

    sget-object v2, Lcom/astrob/navi/astrobnavilib/c;->d:[B

    if-nez v2, :cond_1

    sget v2, Lcom/astrob/navi/astrobnavilib/c;->e:I

    new-array v2, v2, [B

    sput-object v2, Lcom/astrob/navi/astrobnavilib/c;->d:[B

    :cond_1
    const-string v2, "android.permission.ACCESS_COARSE_LOCATION"

    invoke-static {p0, v2}, Landroid/support/v4/a/a;->a(Landroid/content/Context;Ljava/lang/String;)I

    move-result v2

    if-nez v2, :cond_5

    sget-object v2, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    const-string v3, "getLocationManager"

    invoke-static {v2, v3}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    sget-object v2, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    if-nez v2, :cond_2

    const-string v2, "location"

    invoke-virtual {p0, v2}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object p0

    check-cast p0, Landroid/location/LocationManager;

    sput-object p0, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    :cond_2
    sget-object p0, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    const-string v2, "gps"

    invoke-virtual {p0, v2}, Landroid/location/LocationManager;->isProviderEnabled(Ljava/lang/String;)Z

    move-result p0

    if-eqz p0, :cond_5

    new-instance p0, Lorg/json/JSONObject;

    invoke-direct {p0}, Lorg/json/JSONObject;-><init>()V

    sput-object p0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    sget-object p0, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    const-string v2, "gps"

    invoke-virtual {p0, v2}, Landroid/location/LocationManager;->getLastKnownLocation(Ljava/lang/String;)Landroid/location/Location;

    move-result-object p0

    if-eqz p0, :cond_3

    sget-object v2, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "getLastKnownLocation="

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p0}, Landroid/location/Location;->toString()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v2, v3}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {p0}, Lcom/astrob/navi/astrobnavilib/c;->b(Landroid/location/Location;)V

    :cond_3
    sget-boolean p0, Lcom/astrob/navi/astrobnavilib/c;->l:Z

    if-eqz p0, :cond_4

    new-instance p0, Lcom/astrob/navi/astrobnavilib/c$a;

    invoke-direct {p0, v0}, Lcom/astrob/navi/astrobnavilib/c$a;-><init>(B)V

    sput-object p0, Lcom/astrob/navi/astrobnavilib/c;->m:Lcom/astrob/navi/astrobnavilib/c$a;

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/c$a;->start()V

    goto :goto_0

    :cond_4
    const/4 p0, 0x0

    invoke-static {p0}, Lcom/astrob/navi/astrobnavilib/c;->b(Landroid/os/Looper;)V

    :goto_0
    sput-boolean v1, Lcom/astrob/navi/astrobnavilib/c;->i:Z

    :cond_5
    return-void

    :cond_6
    :goto_1
    sget-boolean p0, Lcom/astrob/navi/astrobnavilib/c;->i:Z

    if-eqz p0, :cond_7

    sget-object p0, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    const-string v0, "GPS is started"

    invoke-static {p0, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    :cond_7
    return-void
.end method

.method static synthetic a(Landroid/location/Location;)V
    .locals 0

    invoke-static {p0}, Lcom/astrob/navi/astrobnavilib/c;->b(Landroid/location/Location;)V

    return-void
.end method

.method static synthetic a(Landroid/os/Looper;)V
    .locals 0

    invoke-static {p0}, Lcom/astrob/navi/astrobnavilib/c;->b(Landroid/os/Looper;)V

    return-void
.end method

.method static synthetic b()I
    .locals 1

    sget v0, Lcom/astrob/navi/astrobnavilib/c;->c:I

    return v0
.end method

.method private static b(Landroid/location/Location;)V
    .locals 6

    :try_start_0
    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v1, "latitude"

    invoke-virtual {p0}, Landroid/location/Location;->getLatitude()D

    move-result-wide v2

    invoke-virtual {v0, v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v1, "longitude"

    invoke-virtual {p0}, Landroid/location/Location;->getLongitude()D

    move-result-wide v2

    invoke-virtual {v0, v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v1, "accuracy"

    invoke-virtual {p0}, Landroid/location/Location;->getAccuracy()F

    move-result v2

    float-to-double v2, v2

    invoke-virtual {v0, v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v1, "altitude"

    invoke-virtual {p0}, Landroid/location/Location;->getAltitude()D

    move-result-wide v2

    invoke-virtual {v0, v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v1, "bearing"

    invoke-virtual {p0}, Landroid/location/Location;->getBearing()F

    move-result v2

    float-to-double v2, v2

    invoke-virtual {v0, v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v1, "speed"

    invoke-virtual {p0}, Landroid/location/Location;->getSpeed()F

    move-result v2

    float-to-double v2, v2

    invoke-virtual {v0, v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    invoke-static {}, Ljava/util/Calendar;->getInstance()Ljava/util/Calendar;

    move-result-object v1

    invoke-virtual {p0}, Landroid/location/Location;->getTime()J

    move-result-wide v2

    invoke-virtual {v1, v2, v3}, Ljava/util/Calendar;->setTimeInMillis(J)V

    const-string v2, "year"

    const/4 v3, 0x1

    invoke-virtual {v1, v3}, Ljava/util/Calendar;->get(I)I

    move-result v4

    invoke-virtual {v0, v2, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "month"

    const/4 v4, 0x2

    invoke-virtual {v1, v4}, Ljava/util/Calendar;->get(I)I

    move-result v4

    invoke-virtual {v0, v2, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "day"

    const/4 v4, 0x5

    invoke-virtual {v1, v4}, Ljava/util/Calendar;->get(I)I

    move-result v4

    invoke-virtual {v0, v2, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "hour"

    const/16 v4, 0xb

    invoke-virtual {v1, v4}, Ljava/util/Calendar;->get(I)I

    move-result v4

    invoke-virtual {v0, v2, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "minute"

    const/16 v4, 0xc

    invoke-virtual {v1, v4}, Ljava/util/Calendar;->get(I)I

    move-result v4

    invoke-virtual {v0, v2, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "second"

    const/16 v4, 0xd

    invoke-virtual {v1, v4}, Ljava/util/Calendar;->get(I)I

    move-result v1

    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    sget-object v1, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v2, "time"

    invoke-virtual {v1, v2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v1, "fixed"

    invoke-virtual {v0, v1, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    invoke-virtual {p0}, Landroid/location/Location;->getExtras()Landroid/os/Bundle;

    move-result-object p0

    if-eqz p0, :cond_1

    const-string v0, "AmapAutoDRPos"

    invoke-virtual {p0, v0}, Landroid/os/Bundle;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p0
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    if-eqz p0, :cond_0

    :try_start_1
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0, p0}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    sget-object p0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    const-string v1, "speed"

    const-string v2, "speed"

    invoke-virtual {v0, v2}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v2

    const-wide v4, 0x400ccccccccccccdL    # 3.6

    div-double/2addr v2, v4

    invoke-virtual {p0, v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;
    :try_end_1
    .catch Lorg/json/JSONException; {:try_start_1 .. :try_end_1} :catch_0
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_1

    return-void

    :catch_0
    move-exception p0

    :try_start_2
    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    const-string v1, "json parse failed"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {p0}, Lorg/json/JSONException;->printStackTrace()V

    return-void

    :cond_0
    sget-object p0, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    const-string v0, "has not key: AmapAutoDRPos"

    invoke-static {p0, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_1

    :cond_1
    return-void

    :catch_1
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/Exception;->printStackTrace()V

    return-void
.end method

.method private static b(Landroid/os/Looper;)V
    .locals 9

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    const-string v1, "registerLocationListener"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    sget-object v2, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    const-string v3, "gps"

    sget-object v7, Lcom/astrob/navi/astrobnavilib/c;->n:Landroid/location/LocationListener;

    const-wide/16 v4, 0x1f4

    const/4 v6, 0x0

    move-object v8, p0

    invoke-virtual/range {v2 .. v8}, Landroid/location/LocationManager;->requestLocationUpdates(Ljava/lang/String;JFLandroid/location/LocationListener;Landroid/os/Looper;)V

    sget-object p0, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->o:Landroid/location/GpsStatus$Listener;

    invoke-virtual {p0, v0}, Landroid/location/LocationManager;->addGpsStatusListener(Landroid/location/GpsStatus$Listener;)Z

    return-void
.end method

.method static synthetic c()Z
    .locals 1

    sget-boolean v0, Lcom/astrob/navi/astrobnavilib/c;->h:Z

    return v0
.end method

.method static synthetic d()Lorg/json/JSONObject;
    .locals 1

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->f:Lorg/json/JSONObject;

    return-object v0
.end method

.method static synthetic e()Z
    .locals 1

    const/4 v0, 0x0

    sput-boolean v0, Lcom/astrob/navi/astrobnavilib/c;->h:Z

    return v0
.end method

.method static synthetic f()Ljava/lang/String;
    .locals 1

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->k:Ljava/lang/String;

    return-object v0
.end method

.method static synthetic g()Landroid/content/Context;
    .locals 1

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->j:Landroid/content/Context;

    return-object v0
.end method

.method static synthetic h()Landroid/location/LocationManager;
    .locals 1

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    return-object v0
.end method

.method static synthetic i()J
    .locals 2

    sget-wide v0, Lcom/astrob/navi/astrobnavilib/c;->g:J

    return-wide v0
.end method

.method private static j()V
    .locals 2

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    if-eqz v0, :cond_0

    sget-object v1, Lcom/astrob/navi/astrobnavilib/c;->n:Landroid/location/LocationListener;

    invoke-virtual {v0, v1}, Landroid/location/LocationManager;->removeUpdates(Landroid/location/LocationListener;)V

    sget-object v0, Lcom/astrob/navi/astrobnavilib/c;->b:Landroid/location/LocationManager;

    sget-object v1, Lcom/astrob/navi/astrobnavilib/c;->o:Landroid/location/GpsStatus$Listener;

    invoke-virtual {v0, v1}, Landroid/location/LocationManager;->removeGpsStatusListener(Landroid/location/GpsStatus$Listener;)V

    :cond_0
    return-void
.end method
