.class public Lcom/astrob/turbodog/NaviAIDLService;
.super Landroid/app/Service;

# interfaces
.implements Lcom/astrob/turbodog/b;
.implements Lcom/astrob/turbodog/d;


# instance fields
.field private a:Lcom/astrob/turbodog/a/b;

.field private volatile b:Z

.field private c:Ljava/util/Timer;

.field private d:I

.field private e:Ljava/lang/String;

.field private f:Lcom/astrob/turbodog/a/a$a;

.field private g:Ljava/lang/String;

.field private h:Ljava/lang/String;

.field private i:Z

.field private volatile j:I

.field private volatile k:I

.field private volatile l:I

.field private volatile m:I

.field private volatile n:Ljava/lang/String;

.field private volatile o:I

.field private volatile p:I


# direct methods
.method public constructor <init>()V
    .locals 2

    invoke-direct {p0}, Landroid/app/Service;-><init>()V

    const/4 v0, 0x1

    iput-boolean v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->c:Ljava/util/Timer;

    const/4 v1, 0x0

    iput v1, p0, Lcom/astrob/turbodog/NaviAIDLService;->d:I

    iput-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    new-instance v0, Lcom/astrob/turbodog/NaviAIDLService$1;

    invoke-direct {v0, p0}, Lcom/astrob/turbodog/NaviAIDLService$1;-><init>(Lcom/astrob/turbodog/NaviAIDLService;)V

    iput-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->f:Lcom/astrob/turbodog/a/a$a;

    const-string v0, "NaviAIDLService"

    const-string v1, "NaviAIDLService"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method private a(I)I
    .locals 6

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isAppRunInBack()Z

    move-result v0

    if-eqz v0, :cond_2

    const/16 p1, 0x272d

    return p1

    :cond_2
    if-ltz p1, :cond_c

    const/4 v0, 0x4

    if-le p1, v0, :cond_3

    goto :goto_4

    :cond_3
    const/4 v0, 0x3

    const/4 v2, 0x2

    if-eqz p1, :cond_7

    if-ne p1, v2, :cond_4

    goto :goto_1

    :cond_4
    if-eq p1, v1, :cond_6

    if-ne p1, v0, :cond_5

    goto :goto_0

    :cond_5
    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v3

    goto :goto_2

    :cond_6
    :goto_0
    invoke-static {v2}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v3

    goto :goto_2

    :cond_7
    :goto_1
    invoke-static {v1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v3

    :goto_2
    :try_start_0
    new-instance v4, Lorg/json/JSONObject;

    invoke-direct {v4}, Lorg/json/JSONObject;-><init>()V

    const-string v5, "id"

    invoke-virtual {v4, v5, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v3, "response"

    iget-boolean v5, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v5, :cond_8

    const/4 v5, 0x1

    goto :goto_3

    :cond_8
    const/4 v5, 0x0

    :goto_3
    invoke-virtual {v4, v3, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    if-eq p1, v2, :cond_9

    if-ne p1, v0, :cond_a

    :cond_9
    const-string p1, "data"

    invoke-virtual {v4, p1, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    :cond_a
    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v0, "request"

    invoke-virtual {p1, v0, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_b

    const/16 p1, 0x2710

    return p1

    :cond_b
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1

    :cond_c
    :goto_4
    const/16 p1, 0x2711

    return p1
.end method

.method private a(III)I
    .locals 5

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    const/16 v0, 0x2711

    if-eqz p1, :cond_2

    if-eq p1, v1, :cond_2

    return v0

    :cond_2
    const/4 v2, -0x1

    if-eq p2, v2, :cond_3

    if-eqz p2, :cond_3

    if-eq p2, v1, :cond_3

    return v0

    :cond_3
    if-eq p3, v2, :cond_6

    if-lez p3, :cond_5

    const/4 v3, 0x5

    if-le p3, v3, :cond_4

    goto :goto_0

    :cond_4
    invoke-static {p3}, Lcom/astrob/turbodog/NaviAIDLService;->i(I)I

    move-result p3

    goto :goto_1

    :cond_5
    :goto_0
    return v0

    :cond_6
    :goto_1
    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v3, "id"

    const/16 v4, 0x1a

    invoke-static {v4}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v4

    invoke-virtual {v0, v3, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v3, "response"

    iget-boolean v4, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v4, :cond_7

    goto :goto_2

    :cond_7
    const/4 v1, 0x0

    :goto_2
    invoke-virtual {v0, v3, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v3, "type"

    invoke-virtual {v1, v3, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    if-eq p2, v2, :cond_8

    const-string p1, "enterRoutePlan"

    invoke-virtual {v1, p1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    :cond_8
    if-eq p3, v2, :cond_9

    const-string p1, "strategy"

    invoke-virtual {v1, p1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    :cond_9
    const-string p1, "data"

    invoke-virtual {v0, p1, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string p2, "request"

    invoke-virtual {p1, p2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p2

    iget-object p2, p2, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p2}, Lcom/astrob/navi/astrobnavilib/j;->isAppActivityStartup()Z

    move-result p2

    const/16 p3, 0x2710

    if-nez p2, :cond_a

    iput-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    new-instance p1, Landroid/content/Intent;

    invoke-direct {p1}, Landroid/content/Intent;-><init>()V

    const-string p2, "android.intent.action.MAIN"

    invoke-virtual {p1, p2}, Landroid/content/Intent;->setAction(Ljava/lang/String;)Landroid/content/Intent;

    const-string p2, "android.intent.category.LAUNCHER"

    invoke-virtual {p1, p2}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    const/high16 p2, 0x10000000

    invoke-virtual {p1, p2}, Landroid/content/Intent;->setFlags(I)Landroid/content/Intent;

    new-instance p2, Landroid/content/ComponentName;

    const-string v0, "com.astrob.turbodog"

    const-string v1, "com.astrob.turbodog.WelcomeActivity"

    invoke-direct {p2, v0, v1}, Landroid/content/ComponentName;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p1, p2}, Landroid/content/Intent;->setComponent(Landroid/content/ComponentName;)Landroid/content/Intent;

    invoke-virtual {p0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->startActivity(Landroid/content/Intent;)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    const/16 p2, 0x64

    invoke-virtual {p1, p2}, Lcom/astrob/navi/astrobnavilib/j;->setStartNaviType(I)V

    return p3

    :cond_a
    const/4 p2, 0x0

    iput-object p2, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_b

    return p3

    :cond_b
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1
.end method

.method private a(ILjava/lang/String;I)I
    .locals 3

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    const/16 v0, 0x2711

    if-eqz p1, :cond_2

    return v0

    :cond_2
    invoke-static {p2}, Lcom/astrob/turbodog/NaviAIDLService;->a(Ljava/lang/String;)Z

    move-result p1

    if-eqz p1, :cond_3

    return v0

    :cond_3
    :try_start_0
    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v0, "id"

    const/16 v2, 0x15

    invoke-static {v2}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v2

    invoke-virtual {p1, v0, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v0, "response"

    iget-boolean v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v2, :cond_4

    goto :goto_0

    :cond_4
    const/4 v1, 0x0

    :goto_0
    invoke-virtual {p1, v0, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "maxNum"

    invoke-virtual {v0, v1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p3, "keywords"

    invoke-virtual {v0, p3, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string p2, "data"

    invoke-virtual {p1, p2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    new-instance p2, Lorg/json/JSONObject;

    invoke-direct {p2}, Lorg/json/JSONObject;-><init>()V

    const-string p3, "request"

    invoke-virtual {p2, p3, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p2}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_5

    const/16 p1, 0x2710

    return p1

    :cond_5
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1
.end method

.method private a(ILjava/lang/String;IIDD)I
    .locals 3

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    const/16 v0, 0x2711

    if-eq p1, v1, :cond_2

    return v0

    :cond_2
    invoke-static {p2}, Lcom/astrob/turbodog/NaviAIDLService;->a(Ljava/lang/String;)Z

    move-result p1

    if-eqz p1, :cond_3

    return v0

    :cond_3
    if-lez p4, :cond_4

    const p1, 0xc350

    if-lt p4, p1, :cond_5

    :cond_4
    const/16 p4, 0xbb8

    :cond_5
    :try_start_0
    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v0, "id"

    const/16 v2, 0x16

    invoke-static {v2}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v2

    invoke-virtual {p1, v0, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v0, "response"

    iget-boolean v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v2, :cond_6

    goto :goto_0

    :cond_6
    const/4 v1, 0x0

    :goto_0
    invoke-virtual {p1, v0, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "maxNum"

    invoke-virtual {v0, v1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p3, "range"

    invoke-virtual {v0, p3, p4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p3, "sort"

    const/4 p4, 0x3

    invoke-virtual {v0, p3, p4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p3, "keywords"

    invoke-virtual {v0, p3, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-wide p2, 0x4066800000000000L    # 180.0

    cmpl-double p4, p5, p2

    if-eqz p4, :cond_7

    const-wide p2, 0x4056800000000000L    # 90.0

    cmpl-double p4, p7, p2

    if-eqz p4, :cond_7

    const-wide/16 p2, 0x0

    cmpl-double p4, p5, p2

    if-eqz p4, :cond_7

    cmpl-double p4, p7, p2

    if-eqz p4, :cond_7

    const-string p2, "lon"

    invoke-virtual {v0, p2, p5, p6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string p2, "lat"

    invoke-virtual {v0, p2, p7, p8}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    :cond_7
    const-string p2, "data"

    invoke-virtual {p1, p2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    new-instance p2, Lorg/json/JSONObject;

    invoke-direct {p2}, Lorg/json/JSONObject;-><init>()V

    const-string p3, "request"

    invoke-virtual {p2, p3, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p2}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_8

    const/16 p1, 0x2710

    return p1

    :cond_8
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1
.end method

.method private a(ILorg/json/JSONObject;)I
    .locals 15

    move-object v10, p0

    move/from16 v0, p1

    move-object/from16 v1, p2

    const/16 v2, 0x7530

    const/16 v3, 0x2710

    const/4 v4, 0x2

    const/4 v5, 0x1

    const/16 v6, 0x2711

    if-ne v0, v2, :cond_2

    if-eqz v1, :cond_1

    :try_start_0
    const-string v0, "actionType"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    const-string v2, "operaType"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v1

    if-ne v0, v5, :cond_0

    invoke-direct {p0, v1}, Lcom/astrob/turbodog/NaviAIDLService;->a(I)I

    move-result v3

    goto/16 :goto_a

    :cond_0
    if-ne v0, v4, :cond_1

    invoke-direct {p0, v1}, Lcom/astrob/turbodog/NaviAIDLService;->b(I)I

    move-result v3

    goto/16 :goto_a

    :catch_0
    move-exception v0

    goto/16 :goto_9

    :cond_1
    const/16 v3, 0x2711

    goto/16 :goto_a

    :cond_2
    const/16 v2, 0x7531

    if-ne v0, v2, :cond_3

    if-eqz v1, :cond_1

    const-string v0, "type"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->c(I)I

    move-result v3

    goto/16 :goto_a

    :cond_3
    const/16 v2, 0x7532

    if-ne v0, v2, :cond_4

    if-eqz v1, :cond_1

    const-string v0, "type"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->d(I)I

    move-result v3

    goto/16 :goto_a

    :cond_4
    const/16 v2, 0x76c0

    if-ne v0, v2, :cond_7

    if-eqz v1, :cond_1

    const-string v0, "destType"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    const-string v2, "directNavi"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v2

    const/4 v3, -0x1

    if-eqz v2, :cond_5

    const-string v2, "directNavi"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v2

    goto :goto_0

    :cond_5
    const/4 v2, -0x1

    :goto_0
    const-string v4, "strategy"

    invoke-virtual {v1, v4}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v4

    if-eqz v4, :cond_6

    const-string v3, "strategy"

    invoke-virtual {v1, v3}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v3

    :cond_6
    invoke-direct {p0, v0, v2, v3}, Lcom/astrob/turbodog/NaviAIDLService;->a(III)I

    move-result v3

    goto/16 :goto_a

    :cond_7
    const/16 v2, 0x76c2

    if-ne v0, v2, :cond_8

    invoke-direct {p0, v1}, Lcom/astrob/turbodog/NaviAIDLService;->a(Lorg/json/JSONObject;)I

    move-result v3

    goto/16 :goto_a

    :cond_8
    const/16 v2, 0x76c4

    if-ne v0, v2, :cond_a

    if-eqz v1, :cond_1

    const-string v0, "selectType"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    const-string v2, "isStartNavi"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_9

    const-string v2, "isStartNavi"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->getBoolean(Ljava/lang/String;)Z

    move-result v5

    :cond_9
    invoke-direct {p0, v5, v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(ZI)I

    move-result v3

    goto/16 :goto_a

    :cond_a
    const/16 v2, 0x76c6

    if-ne v0, v2, :cond_b

    if-eqz v1, :cond_1

    const-string v0, "actionType"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->e(I)I

    move-result v3

    goto/16 :goto_a

    :cond_b
    const/16 v2, 0x76c5

    if-ne v0, v2, :cond_c

    if-eqz v1, :cond_1

    const-string v0, "strategy"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->f(I)I

    move-result v3

    goto/16 :goto_a

    :cond_c
    const/16 v2, 0x76c9

    if-ne v0, v2, :cond_d

    const/16 v3, 0x272c

    goto/16 :goto_a

    :cond_d
    const/16 v2, 0x772d

    if-ne v0, v2, :cond_e

    invoke-direct {p0, v1}, Lcom/astrob/turbodog/NaviAIDLService;->b(Lorg/json/JSONObject;)I

    move-result v3

    goto/16 :goto_a

    :cond_e
    const/16 v2, 0x765c

    const/16 v7, 0xf

    const/4 v8, 0x0

    if-ne v0, v2, :cond_14

    if-eqz v1, :cond_1

    const-string v0, "searchType"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    const-string v2, "keywords"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    const-string v3, "maxCount"

    invoke-virtual {v1, v3}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v3

    if-eqz v3, :cond_f

    const-string v3, "maxCount"

    invoke-virtual {v1, v3}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v7

    :cond_f
    const-string v3, "mylocLon"

    invoke-virtual {v1, v3}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v3

    if-eqz v3, :cond_10

    const-string v3, "mylocLon"

    invoke-virtual {v1, v3}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    const/4 v3, 0x1

    goto :goto_1

    :cond_10
    const/4 v3, 0x0

    :goto_1
    const-string v4, "mylocLat"

    invoke-virtual {v1, v4}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v4

    if-eqz v4, :cond_11

    const-string v4, "mylocLat"

    invoke-virtual {v1, v4}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    goto :goto_2

    :cond_11
    const/4 v5, 0x0

    :goto_2
    if-eqz v3, :cond_12

    if-nez v5, :cond_13

    :cond_12
    if-nez v3, :cond_1

    if-nez v5, :cond_1

    :cond_13
    invoke-direct {p0, v0, v2, v7}, Lcom/astrob/turbodog/NaviAIDLService;->a(ILjava/lang/String;I)I

    move-result v3

    goto/16 :goto_a

    :cond_14
    const/16 v2, 0x765d

    if-ne v0, v2, :cond_1c

    if-eqz v1, :cond_1

    const-string v0, "searchType"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v2

    const-string v0, "keywords"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    const-string v0, "maxCount"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_15

    const-string v0, "maxCount"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    move v4, v0

    goto :goto_3

    :cond_15
    const/16 v4, 0xf

    :goto_3
    const/16 v0, 0xbb8

    const-string v7, "radius"

    invoke-virtual {v1, v7}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v7

    if-eqz v7, :cond_16

    const-string v0, "radius"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    :cond_16
    const-string v7, "sortrule"

    invoke-virtual {v1, v7}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v7

    if-eqz v7, :cond_17

    const-string v7, "sortrule"

    invoke-virtual {v1, v7}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    :cond_17
    const-wide v11, 0x4066800000000000L    # 180.0

    const-wide v13, 0x4056800000000000L    # 90.0

    const-string v7, "mylocLon"

    invoke-virtual {v1, v7}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v7

    if-eqz v7, :cond_18

    const-string v7, "mylocLon"

    invoke-virtual {v1, v7}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v11

    const/4 v7, 0x1

    goto :goto_4

    :cond_18
    const/4 v7, 0x0

    :goto_4
    const-string v9, "mylocLat"

    invoke-virtual {v1, v9}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v9

    if-eqz v9, :cond_19

    const-string v8, "mylocLat"

    invoke-virtual {v1, v8}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v8

    goto :goto_5

    :cond_19
    move-wide v8, v13

    const/4 v5, 0x0

    :goto_5
    if-eqz v7, :cond_1a

    if-nez v5, :cond_1b

    :cond_1a
    if-nez v7, :cond_1

    if-nez v5, :cond_1

    :cond_1b
    move-object v1, p0

    move v5, v0

    move-wide v6, v11

    invoke-direct/range {v1 .. v9}, Lcom/astrob/turbodog/NaviAIDLService;->a(ILjava/lang/String;IIDD)I

    move-result v3

    goto/16 :goto_a

    :cond_1c
    const/16 v2, 0x765e

    if-ne v0, v2, :cond_1d

    if-eqz v1, :cond_1

    const-string v0, "alongSearchType"

    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->g(I)I

    move-result v3

    goto :goto_a

    :cond_1d
    const/16 v1, 0x75f8

    if-ne v0, v1, :cond_25

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/16 v1, 0xb

    if-eqz v0, :cond_1e

    const/16 v1, 0x9

    goto :goto_6

    :cond_1e
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v2

    iget-object v2, v2, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->isAppActivityStartup()Z

    move-result v2

    if-nez v2, :cond_1f

    goto :goto_6

    :cond_1f
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v2

    iget-object v2, v2, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->isAppRunInBack()Z

    move-result v2

    if-eqz v2, :cond_20

    goto :goto_6

    :cond_20
    const/16 v1, 0xa

    :goto_6
    invoke-direct {p0}, Lcom/astrob/turbodog/NaviAIDLService;->i()V

    invoke-direct {p0, v1}, Lcom/astrob/turbodog/NaviAIDLService;->h(I)V

    if-nez v0, :cond_24

    invoke-static {v5}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviStatus(I)I

    move-result v0

    if-eq v0, v5, :cond_21

    if-eq v0, v4, :cond_21

    const/4 v1, 0x4

    if-ne v0, v1, :cond_24

    :cond_21
    if-eq v0, v5, :cond_23

    if-ne v0, v4, :cond_22

    goto :goto_7

    :cond_22
    const/4 v0, 0x1

    goto :goto_8

    :cond_23
    :goto_7
    const/16 v0, 0x10

    :goto_8
    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->h(I)V

    :cond_24
    iput-boolean v5, v10, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    goto :goto_a

    :cond_25
    const/16 v1, 0x76c7

    if-ne v0, v1, :cond_26

    invoke-direct {p0}, Lcom/astrob/turbodog/NaviAIDLService;->k()I

    move-result v3
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_a

    :goto_9
    invoke-virtual {v0}, Lorg/json/JSONException;->printStackTrace()V

    const/16 v3, 0x2730

    :cond_26
    :goto_a
    return v3
.end method

.method static synthetic a(Lcom/astrob/turbodog/NaviAIDLService;)I
    .locals 2

    iget v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->d:I

    add-int/lit8 v1, v0, 0x1

    iput v1, p0, Lcom/astrob/turbodog/NaviAIDLService;->d:I

    return v0
.end method

.method private a(Lorg/json/JSONObject;)I
    .locals 12

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    const/16 v0, 0x2711

    if-eqz p1, :cond_f

    invoke-virtual {p1}, Lorg/json/JSONObject;->length()I

    move-result v2

    if-nez v2, :cond_2

    goto/16 :goto_5

    :cond_2
    :try_start_0
    const-string v2, "actionType"

    invoke-virtual {p1, v2}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v2

    if-eqz v2, :cond_3

    if-eq v2, v1, :cond_3

    return v0

    :cond_3
    const-string v3, "strategy"

    invoke-virtual {p1, v3}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v3

    const/4 v4, -0x1

    if-eqz v3, :cond_4

    const-string v3, "strategy"

    invoke-virtual {p1, v3}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v3

    goto :goto_0

    :cond_4
    const/4 v3, -0x1

    :goto_0
    if-eq v3, v4, :cond_7

    if-lez v3, :cond_6

    const/4 v5, 0x5

    if-le v3, v5, :cond_5

    goto :goto_1

    :cond_5
    invoke-static {v3}, Lcom/astrob/turbodog/NaviAIDLService;->i(I)I

    move-result v3

    goto :goto_2

    :cond_6
    :goto_1
    return v0

    :cond_7
    :goto_2
    const-string v5, "endProtocolPoi"

    invoke-virtual {p1, v5}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v5

    if-nez v5, :cond_8

    return v0

    :cond_8
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v5, "id"

    const/16 v6, 0x19

    invoke-static {v6}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v6

    invoke-virtual {v0, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v5, "response"

    iget-boolean v6, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    const/4 v7, 0x0

    if-eqz v6, :cond_9

    goto :goto_3

    :cond_9
    const/4 v1, 0x0

    :goto_3
    invoke-virtual {v0, v5, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v5, "enterRoutePlan"

    invoke-virtual {v1, v5, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    if-eq v3, v4, :cond_a

    const-string v2, "strategy"

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    :cond_a
    const-string v2, "endProtocolPoi"

    invoke-virtual {p1, v2}, Lorg/json/JSONObject;->getJSONObject(Ljava/lang/String;)Lorg/json/JSONObject;

    move-result-object v2

    const-string v3, "poiName"

    invoke-virtual {v2, v3}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    const-string v4, "longitude"

    invoke-virtual {v2, v4}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v4

    const-string v6, "latitude"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v8

    new-instance v2, Lorg/json/JSONObject;

    invoke-direct {v2}, Lorg/json/JSONObject;-><init>()V

    const-string v6, "name"

    invoke-virtual {v2, v6, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v3, "lon"

    invoke-virtual {v2, v3, v4, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v3, "lat"

    invoke-virtual {v2, v3, v8, v9}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v3, "destPoint"

    invoke-virtual {v1, v3, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v2, "midProtocolPois"

    invoke-virtual {p1, v2}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_c

    const-string v2, "midProtocolPois"

    invoke-virtual {p1, v2}, Lorg/json/JSONObject;->getJSONArray(Ljava/lang/String;)Lorg/json/JSONArray;

    move-result-object p1

    invoke-virtual {p1}, Lorg/json/JSONArray;->length()I

    move-result v2

    if-lez v2, :cond_c

    new-instance v2, Lorg/json/JSONArray;

    invoke-direct {v2}, Lorg/json/JSONArray;-><init>()V

    :goto_4
    invoke-virtual {p1}, Lorg/json/JSONArray;->length()I

    move-result v3

    if-ge v7, v3, :cond_b

    invoke-virtual {p1, v7}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v3

    new-instance v4, Lorg/json/JSONObject;

    invoke-direct {v4}, Lorg/json/JSONObject;-><init>()V

    const-string v5, "poiName"

    invoke-virtual {v3, v5}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v5

    const-string v6, "longitude"

    invoke-virtual {v3, v6}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v8

    const-string v6, "latitude"

    invoke-virtual {v3, v6}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v10

    const-string v3, "name"

    invoke-virtual {v4, v3, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v3, "lon"

    invoke-virtual {v4, v3, v8, v9}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v3, "lat"

    invoke-virtual {v4, v3, v10, v11}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    invoke-virtual {v2, v7, v4}, Lorg/json/JSONArray;->put(ILjava/lang/Object;)Lorg/json/JSONArray;

    add-int/lit8 v7, v7, 0x1

    goto :goto_4

    :cond_b
    const-string p1, "wayPoint"

    invoke-virtual {v1, p1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    :cond_c
    const-string p1, "data"

    invoke-virtual {v0, p1, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "request"

    invoke-virtual {p1, v1, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isAppActivityStartup()Z

    move-result v0

    const/16 v1, 0x2710

    if-nez v0, :cond_d

    iput-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    new-instance p1, Landroid/content/Intent;

    invoke-direct {p1}, Landroid/content/Intent;-><init>()V

    const-string v0, "android.intent.action.MAIN"

    invoke-virtual {p1, v0}, Landroid/content/Intent;->setAction(Ljava/lang/String;)Landroid/content/Intent;

    const-string v0, "android.intent.category.LAUNCHER"

    invoke-virtual {p1, v0}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    const/high16 v0, 0x10000000

    invoke-virtual {p1, v0}, Landroid/content/Intent;->setFlags(I)Landroid/content/Intent;

    new-instance v0, Landroid/content/ComponentName;

    const-string v2, "com.astrob.turbodog"

    const-string v3, "com.astrob.turbodog.WelcomeActivity"

    invoke-direct {v0, v2, v3}, Landroid/content/ComponentName;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p1, v0}, Landroid/content/Intent;->setComponent(Landroid/content/ComponentName;)Landroid/content/Intent;

    invoke-virtual {p0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->startActivity(Landroid/content/Intent;)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    const/16 v0, 0x64

    invoke-virtual {p1, v0}, Lcom/astrob/navi/astrobnavilib/j;->setStartNaviType(I)V

    return v1

    :cond_d
    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_e

    return v1

    :cond_e
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1

    :cond_f
    :goto_5
    return v0
.end method

.method private a(ZI)I
    .locals 5

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    if-ltz p2, :cond_6

    const/4 v0, 0x3

    if-le p2, v0, :cond_2

    goto :goto_2

    :cond_2
    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "id"

    const/16 v3, 0x1b

    invoke-static {v3}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v3

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "response"

    iget-boolean v3, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    const/4 v4, 0x0

    if-eqz v3, :cond_3

    const/4 v3, 0x1

    goto :goto_0

    :cond_3
    const/4 v3, 0x0

    :goto_0
    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v2, Lorg/json/JSONObject;

    invoke-direct {v2}, Lorg/json/JSONObject;-><init>()V

    const-string v3, "selType"

    invoke-virtual {v2, v3, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p2, "isStartNavi"

    if-eqz p1, :cond_4

    goto :goto_1

    :cond_4
    const/4 v1, 0x0

    :goto_1
    invoke-virtual {v2, p2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "data"

    invoke-virtual {v0, p1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string p2, "request"

    invoke-virtual {p1, p2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_5

    const/16 p1, 0x2710

    return p1

    :cond_5
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1

    :cond_6
    :goto_2
    const/16 p1, 0x2711

    return p1
.end method

.method static synthetic a(Lcom/astrob/turbodog/NaviAIDLService;Lcom/astrob/turbodog/a/b;)Lcom/astrob/turbodog/a/b;
    .locals 0

    iput-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    return-object p1
.end method

.method private a(IILorg/json/JSONObject;)V
    .locals 4

    invoke-direct {p0}, Lcom/astrob/turbodog/NaviAIDLService;->i()V

    iget-boolean v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    const/4 v1, 0x1

    if-nez v0, :cond_0

    iput-boolean v1, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    return-void

    :cond_0
    const/4 v0, -0x1

    if-ne p1, v0, :cond_1

    iput-boolean v1, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    return-void

    :cond_1
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    :try_start_0
    const-string v2, "versionName"

    iget-object v3, p0, Lcom/astrob/turbodog/NaviAIDLService;->g:Ljava/lang/String;

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v2, "responseCode"

    iget-object v3, p0, Lcom/astrob/turbodog/NaviAIDLService;->h:Ljava/lang/String;

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v2, "requestAuthor"

    const-string v3, "com.astrob.turbodog"

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v2, "protocolId"

    invoke-virtual {v0, v2, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "messageType"

    const-string v3, "response"

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v2, "statusCode"

    const/16 v3, 0x2710

    if-ne p2, v3, :cond_2

    const/16 p2, 0xc8

    goto :goto_0

    :cond_2
    const/4 p2, 0x0

    :goto_0
    invoke-virtual {v0, v2, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p2, "data"

    invoke-virtual {v0, p2, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p2

    iget-object p3, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    if-eqz p3, :cond_3

    iget-object p3, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    invoke-interface {p3, p2}, Lcom/astrob/turbodog/a/b;->a(Ljava/lang/String;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_1
    .catch Landroid/os/RemoteException; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_2

    :catch_0
    move-exception p2

    invoke-virtual {p2}, Landroid/os/RemoteException;->printStackTrace()V

    const-string p2, "NaviAIDLService"

    new-instance p3, Ljava/lang/StringBuilder;

    const-string v0, "Response proid="

    invoke-direct {p3, v0}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p3, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string p1, " failed, becauseof call back failed"

    goto :goto_1

    :catch_1
    move-exception p2

    invoke-virtual {p2}, Lorg/json/JSONException;->printStackTrace()V

    const-string p2, "NaviAIDLService"

    new-instance p3, Ljava/lang/StringBuilder;

    const-string v0, "Response proid="

    invoke-direct {p3, v0}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p3, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string p1, " failed, becauseof generate json string failed"

    :goto_1
    invoke-virtual {p3, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p2, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :cond_3
    :goto_2
    iput-boolean v1, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    return-void
.end method

.method static synthetic a(Lcom/astrob/turbodog/NaviAIDLService;Ljava/lang/String;)V
    .locals 7

    invoke-static {p1}, Lcom/astrob/turbodog/NaviAIDLService;->a(Ljava/lang/String;)Z

    move-result v0

    if-nez v0, :cond_5

    iget-boolean v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    if-nez v0, :cond_0

    const-string p0, "NaviAIDLService"

    const-string p1, "Last protocol is uncomplete, giveup the current protocal"

    invoke-static {p0, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :cond_0
    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    :try_start_0
    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1, p1}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    const-string p1, "versionName"

    invoke-virtual {v1, p1}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    iput-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->g:Ljava/lang/String;

    const-string p1, "requestCode"

    invoke-virtual {v1, p1}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    iput-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->h:Ljava/lang/String;

    const-string p1, "protocolId"

    invoke-virtual {v1, p1}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result p1

    const-string v2, "needResponse"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->getBoolean(Ljava/lang/String;)Z

    move-result v2

    iput-boolean v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    const/4 v2, 0x0

    const-string v3, "data"

    invoke-virtual {v1, v3}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v3

    if-eqz v3, :cond_1

    const-string v2, "data"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->getJSONObject(Ljava/lang/String;)Lorg/json/JSONObject;

    move-result-object v2

    :cond_1
    invoke-direct {p0, p1, v2}, Lcom/astrob/turbodog/NaviAIDLService;->a(ILorg/json/JSONObject;)I

    move-result v1

    iget-boolean v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-nez v2, :cond_2

    const/4 p1, 0x1

    iput-boolean p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    return-void

    :cond_2
    const/16 v2, 0x2710

    if-eq v1, v2, :cond_3

    invoke-direct {p0, p1, v1}, Lcom/astrob/turbodog/NaviAIDLService;->c(II)V

    return-void

    :cond_3
    iget-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->c:Ljava/util/Timer;

    if-nez p1, :cond_4

    new-instance p1, Ljava/util/Timer;

    invoke-direct {p1}, Ljava/util/Timer;-><init>()V

    iput-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->c:Ljava/util/Timer;

    :cond_4
    iget-object v1, p0, Lcom/astrob/turbodog/NaviAIDLService;->c:Ljava/util/Timer;

    new-instance v2, Lcom/astrob/turbodog/NaviAIDLService$2;

    invoke-direct {v2, p0}, Lcom/astrob/turbodog/NaviAIDLService$2;-><init>(Lcom/astrob/turbodog/NaviAIDLService;)V

    const-wide/16 v3, 0x1f4

    const-wide/16 v5, 0x3e8

    invoke-virtual/range {v1 .. v6}, Ljava/util/Timer;->schedule(Ljava/util/TimerTask;JJ)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p1

    const-string v1, "NaviAIDLService"

    const-string v2, "requestJson is a invalid json string!"

    invoke-static {v1, v2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2711

    invoke-direct {p0, v0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->c(II)V

    :cond_5
    return-void
.end method

.method private static a(Ljava/util/List;Lorg/json/JSONObject;)V
    .locals 8
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/List<",
            "Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;",
            ">;",
            "Lorg/json/JSONObject;",
            ")V"
        }
    .end annotation

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const/4 v1, 0x0

    if-nez p0, :cond_0

    :try_start_0
    const-string p0, "Count"

    invoke-virtual {v0, p0, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    goto :goto_1

    :cond_0
    const-string v2, "Count"

    invoke-interface {p0}, Ljava/util/List;->size()I

    move-result v3

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v2, Lorg/json/JSONArray;

    invoke-direct {v2}, Lorg/json/JSONArray;-><init>()V

    :goto_0
    invoke-interface {p0}, Ljava/util/List;->size()I

    move-result v3

    if-ge v1, v3, :cond_1

    invoke-interface {p0, v1}, Ljava/util/List;->get(I)Ljava/lang/Object;

    move-result-object v3

    check-cast v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;

    new-instance v4, Lorg/json/JSONObject;

    invoke-direct {v4}, Lorg/json/JSONObject;-><init>()V

    const-string v5, "Name"

    iget-object v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->name:Ljava/lang/String;

    invoke-virtual {v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v5, "Address"

    iget-object v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->address:Ljava/lang/String;

    invoke-virtual {v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v5, "Latitude"

    iget-wide v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->lat:D

    invoke-virtual {v4, v5, v6, v7}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v5, "longitude"

    iget-wide v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->lon:D

    invoke-virtual {v4, v5, v6, v7}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v5, "distance"

    iget-wide v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->distance:D

    double-to-int v3, v6

    invoke-virtual {v4, v5, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    invoke-virtual {v2, v1, v4}, Lorg/json/JSONArray;->put(ILjava/lang/Object;)Lorg/json/JSONArray;

    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_1
    const-string p0, "Pois"

    invoke-virtual {v0, p0, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    :goto_1
    const-string p0, "poiResult"

    invoke-virtual {p1, p0, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Lorg/json/JSONException;->printStackTrace()V

    const-string p0, "NaviAIDLService"

    const-string p1, "generate search result json string failed"

    invoke-static {p0, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method private static a(Ljava/lang/String;)Z
    .locals 0

    if-eqz p0, :cond_1

    invoke-virtual {p0}, Ljava/lang/String;->isEmpty()Z

    move-result p0

    if-eqz p0, :cond_0

    goto :goto_0

    :cond_0
    const/4 p0, 0x0

    return p0

    :cond_1
    :goto_0
    const/4 p0, 0x1

    return p0
.end method

.method private b(I)I
    .locals 7

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isAppRunInBack()Z

    move-result v0

    if-eqz v0, :cond_2

    const/16 p1, 0x272d

    return p1

    :cond_2
    const/4 v0, -0x1

    const/4 v2, 0x5

    const/4 v3, 0x4

    if-nez p1, :cond_3

    invoke-static {v3}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v4

    goto :goto_2

    :cond_3
    if-ne p1, v1, :cond_4

    invoke-static {v2}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v4

    goto :goto_2

    :cond_4
    const/4 v4, 0x2

    if-ne p1, v4, :cond_5

    const/4 v4, 0x6

    :goto_0
    invoke-static {v4}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v4

    goto :goto_2

    :cond_5
    const/4 v4, 0x3

    if-ne p1, v4, :cond_6

    const/4 v4, 0x7

    goto :goto_0

    :cond_6
    if-eq p1, v3, :cond_8

    if-ne p1, v2, :cond_7

    goto :goto_1

    :cond_7
    const/4 v4, -0x1

    goto :goto_2

    :cond_8
    :goto_1
    const/16 v4, 0xa

    goto :goto_0

    :goto_2
    if-ne v4, v0, :cond_9

    const/16 p1, 0x2711

    return p1

    :cond_9
    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v5, "id"

    invoke-virtual {v0, v5, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v4, "response"

    iget-boolean v5, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    const/4 v6, 0x0

    if-eqz v5, :cond_a

    const/4 v5, 0x1

    goto :goto_3

    :cond_a
    const/4 v5, 0x0

    :goto_3
    invoke-virtual {v0, v4, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    if-eq p1, v3, :cond_b

    if-ne p1, v2, :cond_d

    :cond_b
    const-string v2, "data"

    if-ne p1, v3, :cond_c

    const/4 v1, 0x0

    :cond_c
    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    :cond_d
    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "request"

    invoke-virtual {p1, v1, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_e

    const/16 p1, 0x2710

    return p1

    :cond_e
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1
.end method

.method static synthetic b(Lcom/astrob/turbodog/NaviAIDLService;)I
    .locals 0

    iget p0, p0, Lcom/astrob/turbodog/NaviAIDLService;->d:I

    return p0
.end method

.method private b(Lorg/json/JSONObject;)I
    .locals 8

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    const/16 v0, 0x2711

    if-eqz p1, :cond_c

    invoke-virtual {p1}, Lorg/json/JSONObject;->length()I

    move-result v2

    if-nez v2, :cond_2

    goto/16 :goto_2

    :cond_2
    :try_start_0
    const-string v2, "favoriteType"

    invoke-virtual {p1, v2}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v2

    if-nez v2, :cond_3

    return v0

    :cond_3
    const-string v2, "favoriteType"

    invoke-virtual {p1, v2}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v2

    if-ltz v2, :cond_b

    const/4 v3, 0x2

    if-le v2, v3, :cond_4

    goto/16 :goto_1

    :cond_4
    const-string v0, ""

    const-string v3, "poiName"

    invoke-virtual {p1, v3}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v3

    if-eqz v3, :cond_5

    const-string v0, "poiName"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    :cond_5
    const-wide v3, 0x4066800000000000L    # 180.0

    const-string v5, "longitude"

    invoke-virtual {p1, v5}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v5

    if-eqz v5, :cond_6

    const-string v3, "longitude"

    invoke-virtual {p1, v3}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v3

    :cond_6
    const-string v5, "latitude"

    invoke-virtual {p1, v5}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v5

    if-eqz v5, :cond_7

    const-string v3, "latitude"

    invoke-virtual {p1, v3}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v3

    :cond_7
    const-string v5, ""

    const-string v6, "poiAddress"

    invoke-virtual {p1, v6}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v6

    if-eqz v6, :cond_8

    const-string v5, "poiAddress"

    invoke-virtual {p1, v5}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v5

    :cond_8
    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v6, "id"

    const/16 v7, 0x12

    invoke-static {v7}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v7

    invoke-virtual {p1, v6, v7}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v6, "response"

    iget-boolean v7, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v7, :cond_9

    goto :goto_0

    :cond_9
    const/4 v1, 0x0

    :goto_0
    invoke-virtual {p1, v6, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v6, "name"

    invoke-virtual {v1, v6, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v0, "address"

    invoke-virtual {v1, v0, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v0, "lon"

    invoke-virtual {v1, v0, v3, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v0, "lat"

    const-wide v3, 0x4056800000000000L    # 90.0

    invoke-virtual {v1, v0, v3, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v3, "type"

    invoke-virtual {v0, v3, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "point"

    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "data"

    invoke-virtual {p1, v1, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "request"

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_a

    const/16 p1, 0x2710

    return p1

    :cond_a
    const/16 p1, 0x2724

    return p1

    :cond_b
    :goto_1
    return v0

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1

    :cond_c
    :goto_2
    return v0
.end method

.method private static b(Ljava/util/List;Lorg/json/JSONObject;)V
    .locals 7
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/List<",
            "Lcom/astrob/turbodog/f;",
            ">;",
            "Lorg/json/JSONObject;",
            ")V"
        }
    .end annotation

    const/4 v0, 0x0

    if-nez p0, :cond_0

    :try_start_0
    const-string p0, "count"

    invoke-virtual {p1, p0, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    return-void

    :cond_0
    const-string v1, "count"

    invoke-interface {p0}, Ljava/util/List;->size()I

    move-result v2

    invoke-virtual {p1, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONArray;

    invoke-direct {v1}, Lorg/json/JSONArray;-><init>()V

    :goto_0
    invoke-interface {p0}, Ljava/util/List;->size()I

    move-result v2

    if-ge v0, v2, :cond_1

    invoke-interface {p0, v0}, Ljava/util/List;->get(I)Ljava/lang/Object;

    move-result-object v2

    check-cast v2, Lcom/astrob/turbodog/f;

    new-instance v3, Lorg/json/JSONObject;

    invoke-direct {v3}, Lorg/json/JSONObject;-><init>()V

    const-string v4, "method"

    iget-object v5, v2, Lcom/astrob/turbodog/f;->a:Ljava/lang/String;

    invoke-virtual {v3, v4, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v4, "time"

    iget-wide v5, v2, Lcom/astrob/turbodog/f;->b:D

    invoke-virtual {v3, v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v4, "distance"

    iget-wide v5, v2, Lcom/astrob/turbodog/f;->c:D

    invoke-virtual {v3, v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v4, "tolls"

    iget v2, v2, Lcom/astrob/turbodog/f;->d:I

    invoke-virtual {v3, v4, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    invoke-virtual {v1, v0, v3}, Lorg/json/JSONArray;->put(ILjava/lang/Object;)Lorg/json/JSONArray;

    add-int/lit8 v0, v0, 0x1

    goto :goto_0

    :cond_1
    const-string p0, "protocolRouteInfos"

    invoke-virtual {p1, p0, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Lorg/json/JSONException;->printStackTrace()V

    const-string p0, "NaviAIDLService"

    const-string p1, "generate route result json string failed"

    invoke-static {p0, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method private c(I)I
    .locals 5

    if-eqz p1, :cond_0

    const/16 p1, 0x2711

    return p1

    :cond_0
    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result p1

    const/16 v0, 0x7531

    const/4 v1, 0x1

    const/16 v2, 0x2710

    if-eq p1, v1, :cond_6

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->isAppActivityStartup()Z

    move-result p1

    if-nez p1, :cond_1

    goto :goto_1

    :cond_1
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->isAppRunInBack()Z

    move-result p1

    if-eqz p1, :cond_3

    new-instance p1, Landroid/content/Intent;

    const-string v1, "MOVE_TASK_TO_FRONT"

    invoke-direct {p1, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {p0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->sendBroadcast(Landroid/content/Intent;)V

    iget-boolean p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz p1, :cond_2

    invoke-direct {p0, v0, v2}, Lcom/astrob/turbodog/NaviAIDLService;->c(II)V

    :cond_2
    return v2

    :cond_3
    :try_start_0
    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v0, "id"

    const/16 v3, 0xf

    invoke-static {v3}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v3

    invoke-virtual {p1, v0, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v0, "response"

    iget-boolean v3, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v3, :cond_4

    goto :goto_0

    :cond_4
    const/4 v1, 0x0

    :goto_0
    invoke-virtual {p1, v0, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "request"

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_5

    return v2

    :cond_5
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1

    :cond_6
    :goto_1
    new-instance p1, Landroid/content/Intent;

    invoke-direct {p1}, Landroid/content/Intent;-><init>()V

    const-string v1, "android.intent.action.MAIN"

    invoke-virtual {p1, v1}, Landroid/content/Intent;->setAction(Ljava/lang/String;)Landroid/content/Intent;

    const-string v1, "android.intent.category.LAUNCHER"

    invoke-virtual {p1, v1}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    const/high16 v1, 0x10000000

    invoke-virtual {p1, v1}, Landroid/content/Intent;->setFlags(I)Landroid/content/Intent;

    new-instance v1, Landroid/content/ComponentName;

    const-string v3, "com.astrob.turbodog"

    const-string v4, "com.astrob.turbodog.WelcomeActivity"

    invoke-direct {v1, v3, v4}, Landroid/content/ComponentName;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p1, v1}, Landroid/content/Intent;->setComponent(Landroid/content/ComponentName;)Landroid/content/Intent;

    invoke-virtual {p0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->startActivity(Landroid/content/Intent;)V

    iget-boolean p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz p1, :cond_7

    invoke-direct {p0, v0, v2}, Lcom/astrob/turbodog/NaviAIDLService;->c(II)V

    :cond_7
    return v2
.end method

.method static synthetic c(Lcom/astrob/turbodog/NaviAIDLService;)Ljava/util/Timer;
    .locals 0

    iget-object p0, p0, Lcom/astrob/turbodog/NaviAIDLService;->c:Ljava/util/Timer;

    return-object p0
.end method

.method private c(II)V
    .locals 3

    invoke-direct {p0}, Lcom/astrob/turbodog/NaviAIDLService;->i()V

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    :try_start_0
    const-string v1, "versionName"

    iget-object v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->g:Ljava/lang/String;

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "responseCode"

    iget-object v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->h:Ljava/lang/String;

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "requestAuthor"

    const-string v2, "com.astrob.turbodog"

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "protocolId"

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "messageType"

    const-string v2, "response"

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "statusCode"

    const/16 v2, 0x2710

    if-ne p2, v2, :cond_0

    const/16 v2, 0xc8

    goto :goto_0

    :cond_0
    const/4 v2, 0x0

    :goto_0
    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "resultCode"

    invoke-virtual {v1, v2, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p2, "data"

    invoke-virtual {v0, p2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p2

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    if-eqz v0, :cond_1

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    invoke-interface {v0, p2}, Lcom/astrob/turbodog/a/b;->a(Ljava/lang/String;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_1
    .catch Landroid/os/RemoteException; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_2

    :catch_0
    move-exception p2

    invoke-virtual {p2}, Landroid/os/RemoteException;->printStackTrace()V

    const-string p2, "NaviAIDLService"

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "Response proid="

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string p1, " failed, becauseof call back failed"

    goto :goto_1

    :catch_1
    move-exception p2

    invoke-virtual {p2}, Lorg/json/JSONException;->printStackTrace()V

    const-string p2, "NaviAIDLService"

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "Response proid="

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string p1, " failed, becauseof generate json string failed"

    :goto_1
    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p2, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :cond_1
    :goto_2
    const/4 p1, 0x1

    iput-boolean p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    return-void
.end method

.method private static c(Ljava/util/List;Lorg/json/JSONObject;)V
    .locals 8
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/List<",
            "Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;",
            ">;",
            "Lorg/json/JSONObject;",
            ")V"
        }
    .end annotation

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const/4 v1, 0x0

    if-nez p0, :cond_0

    :try_start_0
    const-string p0, "Count"

    invoke-virtual {v0, p0, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    goto :goto_1

    :cond_0
    const-string v2, "Count"

    invoke-interface {p0}, Ljava/util/List;->size()I

    move-result v3

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v2, Lorg/json/JSONArray;

    invoke-direct {v2}, Lorg/json/JSONArray;-><init>()V

    :goto_0
    invoke-interface {p0}, Ljava/util/List;->size()I

    move-result v3

    if-ge v1, v3, :cond_1

    invoke-interface {p0, v1}, Ljava/util/List;->get(I)Ljava/lang/Object;

    move-result-object v3

    check-cast v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;

    new-instance v4, Lorg/json/JSONObject;

    invoke-direct {v4}, Lorg/json/JSONObject;-><init>()V

    const-string v5, "Poiname"

    iget-object v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->name:Ljava/lang/String;

    invoke-virtual {v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v5, "poi_distance"

    iget-wide v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->distance:D

    double-to-int v6, v6

    invoke-virtual {v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v5, "poi_addr"

    iget-object v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->address:Ljava/lang/String;

    invoke-virtual {v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v5, "Latitude"

    iget-wide v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->lat:D

    invoke-virtual {v4, v5, v6, v7}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v5, "Longitude"

    iget-wide v6, v3, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->lon:D

    invoke-virtual {v4, v5, v6, v7}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    invoke-virtual {v2, v1, v4}, Lorg/json/JSONArray;->put(ILjava/lang/Object;)Lorg/json/JSONArray;

    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_1
    const-string p0, "poi_info"

    invoke-virtual {v0, p0, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    :goto_1
    const-string p0, "poiResult"

    invoke-virtual {p1, p0, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Lorg/json/JSONException;->printStackTrace()V

    const-string p0, "NaviAIDLService"

    const-string p1, "generate search result json string failed"

    invoke-static {p0, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method private d(I)I
    .locals 4

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    const/4 v0, 0x0

    const/4 v2, -0x1

    if-nez p1, :cond_2

    const/4 p1, 0x0

    goto :goto_0

    :cond_2
    if-ne p1, v1, :cond_3

    const/4 p1, 0x1

    goto :goto_0

    :cond_3
    const/4 p1, -0x1

    :goto_0
    if-ne p1, v2, :cond_4

    const/16 p1, 0x2711

    return p1

    :cond_4
    :try_start_0
    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "id"

    const/16 v3, 0x17

    invoke-static {v3}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v3

    invoke-virtual {p1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "response"

    iget-boolean v3, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v3, :cond_5

    const/4 v0, 0x1

    :cond_5
    invoke-virtual {p1, v2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "request"

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_6

    const/16 p1, 0x2710

    return p1

    :cond_6
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1
.end method

.method static synthetic d(Lcom/astrob/turbodog/NaviAIDLService;)Ljava/util/Timer;
    .locals 1

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->c:Ljava/util/Timer;

    return-object v0
.end method

.method private e(I)I
    .locals 5

    const/16 v0, 0x76c6

    const/16 v1, 0x2722

    const/4 v2, 0x1

    const/16 v3, 0x2710

    const/4 v4, 0x3

    if-ne p1, v4, :cond_3

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result p1

    if-ne p1, v2, :cond_0

    return v1

    :cond_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->isAppRunInBack()Z

    move-result p1

    if-nez p1, :cond_1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->moveTaskToBack()V

    :cond_1
    iget-boolean p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz p1, :cond_2

    invoke-direct {p0, v0, v3}, Lcom/astrob/turbodog/NaviAIDLService;->c(II)V

    :cond_2
    return v3

    :cond_3
    const/4 v4, 0x4

    if-ne p1, v4, :cond_6

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result p1

    if-ne p1, v2, :cond_4

    return v1

    :cond_4
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->exitApp()Z

    iget-boolean p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz p1, :cond_5

    invoke-direct {p0, v0, v3}, Lcom/astrob/turbodog/NaviAIDLService;->c(II)V

    :cond_5
    return v3

    :cond_6
    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    if-eqz v0, :cond_8

    if-ne v0, v2, :cond_7

    return v1

    :cond_7
    const/16 p1, 0x2729

    return p1

    :cond_8
    if-ltz p1, :cond_e

    if-le p1, v4, :cond_9

    goto :goto_2

    :cond_9
    const/4 v0, 0x2

    if-ne p1, v0, :cond_a

    const/16 p1, 0x272c

    return p1

    :cond_a
    if-nez p1, :cond_b

    const/16 p1, 0x1c

    goto :goto_0

    :cond_b
    const/16 p1, 0x1e

    :goto_0
    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "id"

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result p1

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "response"

    iget-boolean v1, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v1, :cond_c

    goto :goto_1

    :cond_c
    const/4 v2, 0x0

    :goto_1
    invoke-virtual {v0, p1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "request"

    invoke-virtual {p1, v1, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_d

    return v3

    :cond_d
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1

    :cond_e
    :goto_2
    const/16 p1, 0x2711

    return p1
.end method

.method static synthetic e(Lcom/astrob/turbodog/NaviAIDLService;)I
    .locals 1

    const/4 v0, 0x0

    iput v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->d:I

    return v0
.end method

.method private f(I)I
    .locals 4

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    if-lez p1, :cond_5

    const/4 v0, 0x5

    if-le p1, v0, :cond_2

    goto :goto_1

    :cond_2
    invoke-static {p1}, Lcom/astrob/turbodog/NaviAIDLService;->i(I)I

    move-result p1

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "id"

    const/16 v3, 0x1f

    invoke-static {v3}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v3

    invoke-virtual {v0, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "response"

    iget-boolean v3, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v3, :cond_3

    goto :goto_0

    :cond_3
    const/4 v1, 0x0

    :goto_0
    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "data"

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "request"

    invoke-virtual {p1, v1, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_4

    const/16 p1, 0x2710

    return p1

    :cond_4
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1

    :cond_5
    :goto_1
    const/16 p1, 0x2711

    return p1
.end method

.method static synthetic f(Lcom/astrob/turbodog/NaviAIDLService;)Z
    .locals 1

    const/4 v0, 0x1

    iput-boolean v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->b:Z

    return v0
.end method

.method private g(I)I
    .locals 6

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 p1, 0x2722

    return p1

    :cond_0
    const/16 p1, 0x2729

    return p1

    :cond_1
    if-lez p1, :cond_5

    const/16 v0, 0xc

    if-le p1, v0, :cond_2

    goto/16 :goto_2

    :cond_2
    const/4 v0, 0x2

    const/4 v2, 0x0

    const/16 v3, 0xf

    packed-switch p1, :pswitch_data_0

    const/4 p1, 0x0

    goto :goto_0

    :pswitch_0
    const/16 p1, 0x10

    goto :goto_0

    :pswitch_1
    const/16 p1, 0x13

    goto :goto_0

    :pswitch_2
    const/16 p1, 0xf

    goto :goto_0

    :pswitch_3
    const/4 p1, 0x4

    goto :goto_0

    :pswitch_4
    const/16 p1, 0xb

    goto :goto_0

    :pswitch_5
    const/16 p1, 0xe

    goto :goto_0

    :pswitch_6
    const/4 p1, 0x1

    goto :goto_0

    :pswitch_7
    const/4 p1, 0x2

    goto :goto_0

    :pswitch_8
    const/4 p1, 0x5

    goto :goto_0

    :pswitch_9
    const/4 p1, 0x6

    :goto_0
    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v4, "id"

    const/16 v5, 0x18

    invoke-static {v5}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviInternalMsgReqId(I)I

    move-result v5

    invoke-virtual {v0, v4, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v4, "response"

    iget-boolean v5, p0, Lcom/astrob/turbodog/NaviAIDLService;->i:Z

    if-eqz v5, :cond_3

    goto :goto_1

    :cond_3
    const/4 v1, 0x0

    :goto_1
    invoke-virtual {v0, v4, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "maxNum"

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "category"

    invoke-virtual {v1, v2, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "data"

    invoke-virtual {v0, p1, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    new-instance p1, Lorg/json/JSONObject;

    invoke-direct {p1}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "request"

    invoke-virtual {p1, v1, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {p1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result p1
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    if-eqz p1, :cond_4

    const/16 p1, 0x2710

    return p1

    :cond_4
    const/16 p1, 0x2724

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const/16 p1, 0x2730

    return p1

    :cond_5
    :goto_2
    const/16 p1, 0x2711

    return p1

    nop

    :pswitch_data_0
    .packed-switch 0x1
        :pswitch_9
        :pswitch_8
        :pswitch_7
        :pswitch_7
        :pswitch_6
        :pswitch_5
        :pswitch_4
        :pswitch_3
        :pswitch_2
        :pswitch_1
        :pswitch_2
        :pswitch_0
    .end packed-switch
.end method

.method private h(I)V
    .locals 3

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    :try_start_0
    const-string v1, "versionName"

    iget-object v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->g:Ljava/lang/String;

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "responseCode"

    iget-object v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->h:Ljava/lang/String;

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "requestAuthor"

    const-string v2, "com.astrob.turbodog"

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "protocolId"

    const/16 v2, 0x75f8

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "messageType"

    const-string v2, "response"

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "statusCode"

    const/16 v2, 0xc8

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "autoStatus"

    invoke-virtual {v1, v2, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "data"

    invoke-virtual {v0, p1, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    if-eqz v0, :cond_0

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    invoke-interface {v0, p1}, Lcom/astrob/turbodog/a/b;->a(Ljava/lang/String;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_1
    .catch Landroid/os/RemoteException; {:try_start_0 .. :try_end_0} :catch_0

    :cond_0
    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Landroid/os/RemoteException;->printStackTrace()V

    const-string p1, "NaviAIDLService"

    const-string v0, "Response proid=30200 failed, becauseof call back failed"

    :goto_0
    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :catch_1
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const-string p1, "NaviAIDLService"

    const-string v0, "Response proid=30200 failed, becauseof generate json string failed"

    goto :goto_0
.end method

.method private static i(I)I
    .locals 3

    if-gtz p0, :cond_0

    const/4 p0, -0x1

    return p0

    :cond_0
    const/4 v0, 0x1

    if-ne p0, v0, :cond_1

    return v0

    :cond_1
    const/4 v1, 0x3

    const/4 v2, 0x2

    if-ne p0, v2, :cond_2

    return v1

    :cond_2
    if-ne p0, v1, :cond_3

    return v2

    :cond_3
    return v0
.end method

.method private i()V
    .locals 1

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->c:Ljava/util/Timer;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Ljava/util/Timer;->cancel()V

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->c:Ljava/util/Timer;

    const/4 v0, 0x0

    iput v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->d:I

    :cond_0
    return-void
.end method

.method private static j()I
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    if-eqz v0, :cond_2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isAppActivityStartup()Z

    move-result v0

    if-nez v0, :cond_0

    goto :goto_0

    :cond_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isEngineRunning()Z

    move-result v0

    if-nez v0, :cond_1

    const/4 v0, 0x2

    return v0

    :cond_1
    const/4 v0, 0x0

    return v0

    :cond_2
    :goto_0
    const/4 v0, 0x1

    return v0
.end method

.method private j(I)V
    .locals 3

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    :try_start_0
    const-string v1, "versionName"

    iget-object v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->g:Ljava/lang/String;

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "requestAuthor"

    const-string v2, "com.astrob.turbodog"

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "protocolId"

    const/16 v2, 0x75f8

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "messageType"

    const-string v2, "dispatch"

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "statusCode"

    const/16 v2, 0xc8

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "autoStatus"

    invoke-virtual {v1, v2, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "data"

    invoke-virtual {v0, p1, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    if-eqz v0, :cond_0

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    invoke-interface {v0, p1}, Lcom/astrob/turbodog/a/b;->a(Ljava/lang/String;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_1
    .catch Landroid/os/RemoteException; {:try_start_0 .. :try_end_0} :catch_0

    :cond_0
    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Landroid/os/RemoteException;->printStackTrace()V

    const-string p1, "NaviAIDLService"

    const-string v0, "Response proid=30200 failed, becauseof call back failed"

    :goto_0
    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :catch_1
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const-string p1, "NaviAIDLService"

    const-string v0, "Response proid=30200 failed, becauseof generate json string failed"

    goto :goto_0
.end method

.method private k()I
    .locals 7

    invoke-static {}, Lcom/astrob/turbodog/NaviAIDLService;->j()I

    move-result v0

    const/4 v1, 0x1

    if-eqz v0, :cond_1

    if-ne v0, v1, :cond_0

    const/16 v0, 0x2722

    return v0

    :cond_0
    const/16 v0, 0x2729

    return v0

    :cond_1
    invoke-static {v1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->getNaviStatus(I)I

    move-result v0

    const/4 v2, 0x2

    if-eq v0, v1, :cond_2

    if-eq v0, v2, :cond_2

    const/16 v0, 0x2714

    return v0

    :cond_2
    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v3, "resultCode"

    const/16 v4, 0x2710

    invoke-virtual {v0, v3, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v3, "type"

    const/4 v5, 0x0

    invoke-virtual {v0, v3, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v3, "icon"

    iget v6, p0, Lcom/astrob/turbodog/NaviAIDLService;->j:I

    invoke-virtual {v0, v3, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v3, "segRemainDis"

    iget v6, p0, Lcom/astrob/turbodog/NaviAIDLService;->k:I

    invoke-virtual {v0, v3, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v3, "routeRemainDis"

    iget v6, p0, Lcom/astrob/turbodog/NaviAIDLService;->l:I

    invoke-virtual {v0, v3, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v3, "routeRemainTime"

    iget v6, p0, Lcom/astrob/turbodog/NaviAIDLService;->m:I

    invoke-virtual {v0, v3, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v3, "curRoadName"

    iget-object v6, p0, Lcom/astrob/turbodog/NaviAIDLService;->n:Ljava/lang/String;

    invoke-virtual {v0, v3, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v3, "roadType"

    iget v6, p0, Lcom/astrob/turbodog/NaviAIDLService;->o:I

    if-ne v6, v1, :cond_3

    goto :goto_0

    :cond_3
    const/4 v1, 0x2

    :goto_0
    invoke-virtual {v0, v3, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "limitedSpeed"

    iget v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->p:I

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "carDirection"

    invoke-virtual {v0, v1, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "carLatitude"

    invoke-virtual {v0, v1, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "carLongitude"

    invoke-virtual {v0, v1, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "curSpeed"

    invoke-virtual {v0, v1, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const/16 v1, 0x76c7

    invoke-direct {p0, v1, v4, v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(IILorg/json/JSONObject;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return v4

    :catch_0
    move-exception v0

    invoke-virtual {v0}, Lorg/json/JSONException;->printStackTrace()V

    const/16 v0, 0x2724

    return v0
.end method


# virtual methods
.method public final a()V
    .locals 1

    const/4 v0, 0x7

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isAppActivityStartup()Z

    move-result v0

    if-nez v0, :cond_0

    const/16 v0, 0xb

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    :cond_0
    return-void
.end method

.method public final a(II)V
    .locals 3

    invoke-static {p1}, Lcom/astrob/turbodog/a;->b(I)I

    move-result p1

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "resultCode"

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const/16 v1, 0x2730

    const/16 v2, 0x2710

    if-ne p1, v2, :cond_2

    const/4 v1, 0x1

    if-ne p2, v1, :cond_0

    const/16 v1, 0x2733

    goto :goto_0

    :cond_0
    const/4 v1, 0x2

    if-ne p2, v1, :cond_1

    const/16 v1, 0x2734

    goto :goto_0

    :cond_1
    const/16 v1, 0x2735

    :cond_2
    :goto_0
    const-string p2, "favoritePoiResultCode"

    invoke-virtual {v0, p2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const/16 p2, 0x772d

    invoke-direct {p0, p2, p1, v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(IILorg/json/JSONObject;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    return-void
.end method

.method public final a(IIIILjava/lang/String;II)V
    .locals 4

    iput p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->j:I

    iput p2, p0, Lcom/astrob/turbodog/NaviAIDLService;->k:I

    iput p3, p0, Lcom/astrob/turbodog/NaviAIDLService;->l:I

    iput p4, p0, Lcom/astrob/turbodog/NaviAIDLService;->m:I

    iput-object p5, p0, Lcom/astrob/turbodog/NaviAIDLService;->n:Ljava/lang/String;

    iput p6, p0, Lcom/astrob/turbodog/NaviAIDLService;->o:I

    iput p7, p0, Lcom/astrob/turbodog/NaviAIDLService;->p:I

    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    :try_start_0
    const-string v1, "versionName"

    iget-object v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->g:Ljava/lang/String;

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "requestAuthor"

    const-string v2, "com.astrob.turbodog"

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "protocolId"

    const/16 v2, 0x76c7

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v1, "messageType"

    const-string v2, "dispatch"

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "statusCode"

    const/16 v2, 0xc8

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    const-string v2, "type"

    const/4 v3, 0x0

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v2, "icon"

    invoke-virtual {v1, v2, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "segRemainDis"

    invoke-virtual {v1, p1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "routeRemainDis"

    invoke-virtual {v1, p1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "routeRemainTime"

    invoke-virtual {v1, p1, p4}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "curRoadName"

    invoke-virtual {v1, p1, p5}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string p1, "roadType"

    const/4 p2, 0x1

    if-ne p6, p2, :cond_0

    goto :goto_0

    :cond_0
    const/4 p2, 0x2

    :goto_0
    invoke-virtual {v1, p1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "limitedSpeed"

    invoke-virtual {v1, p1, p7}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "carDirection"

    invoke-virtual {v1, p1, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "carLatitude"

    invoke-virtual {v1, p1, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "carLongitude"

    invoke-virtual {v1, p1, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "curSpeed"

    invoke-virtual {v1, p1, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string p1, "data"

    invoke-virtual {v0, p1, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object p1

    iget-object p2, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    if-eqz p2, :cond_1

    iget-object p2, p0, Lcom/astrob/turbodog/NaviAIDLService;->a:Lcom/astrob/turbodog/a/b;

    invoke-interface {p2, p1}, Lcom/astrob/turbodog/a/b;->a(Ljava/lang/String;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_1
    .catch Landroid/os/RemoteException; {:try_start_0 .. :try_end_0} :catch_0

    :cond_1
    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Landroid/os/RemoteException;->printStackTrace()V

    const-string p1, "NaviAIDLService"

    const-string p2, "Response proid=30407 failed, becauseof call back failed"

    :goto_1
    invoke-static {p1, p2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :catch_1
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    const-string p1, "NaviAIDLService"

    const-string p2, "Response proid=30407 failed, becauseof generate json string failed"

    goto :goto_1
.end method

.method public final a(IILjava/util/List;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(II",
            "Ljava/util/List<",
            "Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;",
            ">;)V"
        }
    .end annotation

    invoke-static {p1}, Lcom/astrob/turbodog/a;->a(I)I

    move-result p1

    invoke-static {p2}, Lcom/astrob/turbodog/a;->b(I)I

    move-result p2

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "resultCode"

    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const/16 v1, 0x765e

    if-ne p1, v1, :cond_0

    invoke-static {p3, v0}, Lcom/astrob/turbodog/NaviAIDLService;->c(Ljava/util/List;Lorg/json/JSONObject;)V

    goto :goto_0

    :cond_0
    const/16 v1, 0x765c

    if-eq p1, v1, :cond_1

    const/16 v1, 0x765d

    if-ne p1, v1, :cond_2

    :cond_1
    invoke-static {p3, v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(Ljava/util/List;Lorg/json/JSONObject;)V

    :cond_2
    :goto_0
    invoke-direct {p0, p1, p2, v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(IILorg/json/JSONObject;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    return-void
.end method

.method public final a(ILjava/lang/String;)V
    .locals 2

    invoke-static {p1}, Lcom/astrob/turbodog/a;->b(I)I

    move-result p1

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "resultCode"

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_1

    if-eqz p2, :cond_1

    :try_start_1
    invoke-virtual {p2}, Ljava/lang/String;->length()I

    move-result v1

    if-nez v1, :cond_0

    goto :goto_0

    :cond_0
    const-string v1, "myLocationName"

    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    goto :goto_1

    :cond_1
    :goto_0
    const-string p2, "myLocationName"

    const-string v1, ""

    invoke-virtual {v0, p2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    :try_end_1
    .catch Lorg/json/JSONException; {:try_start_1 .. :try_end_1} :catch_0

    goto :goto_1

    :catch_0
    move-exception p2

    :try_start_2
    invoke-virtual {p2}, Lorg/json/JSONException;->printStackTrace()V

    const-string p2, "NaviAIDLService"

    const-string v1, "generate search result json string failed"

    invoke-static {p2, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :goto_1
    const/16 p2, 0x7532

    invoke-direct {p0, p2, p1, v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(IILorg/json/JSONObject;)V
    :try_end_2
    .catch Lorg/json/JSONException; {:try_start_2 .. :try_end_2} :catch_1

    return-void

    :catch_1
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    return-void
.end method

.method public final a(ILjava/util/List;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(I",
            "Ljava/util/List<",
            "Lcom/astrob/turbodog/f;",
            ">;)V"
        }
    .end annotation

    invoke-static {p1}, Lcom/astrob/turbodog/a;->b(I)I

    move-result p1

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "resultCode"

    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    invoke-static {p2, v0}, Lcom/astrob/turbodog/NaviAIDLService;->b(Ljava/util/List;Lorg/json/JSONObject;)V

    const/16 p2, 0x76c2

    invoke-direct {p0, p2, p1, v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(IILorg/json/JSONObject;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    return-void
.end method

.method public final a(ZZ)V
    .locals 0

    if-eqz p1, :cond_0

    const/16 p1, 0xe

    goto :goto_0

    :cond_0
    const/16 p1, 0xf

    :goto_0
    invoke-direct {p0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    if-eqz p2, :cond_1

    const/4 p1, 0x1

    invoke-direct {p0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    :cond_1
    return-void
.end method

.method public final b()V
    .locals 3

    const/16 v0, 0xa

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    if-eqz v0, :cond_1

    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v0

    if-nez v0, :cond_1

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->onProtocolRequest(Ljava/lang/String;)Z

    move-result v0

    if-nez v0, :cond_0

    const-string v0, "NaviAIDLService"

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "Send message="

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    iget-object v2, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v2, " failed"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :cond_0
    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->e:Ljava/lang/String;

    :cond_1
    return-void
.end method

.method public final b(II)V
    .locals 2

    invoke-static {p1}, Lcom/astrob/turbodog/a;->a(I)I

    move-result p1

    invoke-static {p2}, Lcom/astrob/turbodog/a;->b(I)I

    move-result p2

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    const-string v1, "resultCode"

    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    invoke-direct {p0, p1, p2, v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(IILorg/json/JSONObject;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    return-void
.end method

.method public final c()V
    .locals 1

    const/16 v0, 0x9

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    return-void
.end method

.method public final d()V
    .locals 1

    const/16 v0, 0xa

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    return-void
.end method

.method public final e()V
    .locals 1

    const/16 v0, 0xb

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    return-void
.end method

.method public final f()V
    .locals 1

    const/16 v0, 0x8

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isAppActivityStartup()Z

    move-result v0

    if-nez v0, :cond_0

    const/16 v0, 0xb

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    :cond_0
    return-void
.end method

.method public final g()V
    .locals 1

    const/16 v0, 0x10

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    return-void
.end method

.method public final h()V
    .locals 2

    const/4 v0, 0x0

    iput v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->j:I

    iput v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->k:I

    iput v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->l:I

    iput v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->m:I

    const-string v1, ""

    iput-object v1, p0, Lcom/astrob/turbodog/NaviAIDLService;->n:Ljava/lang/String;

    iput v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->o:I

    iput v0, p0, Lcom/astrob/turbodog/NaviAIDLService;->p:I

    const/16 v0, 0x11

    invoke-direct {p0, v0}, Lcom/astrob/turbodog/NaviAIDLService;->j(I)V

    return-void
.end method

.method public onBind(Landroid/content/Intent;)Landroid/os/IBinder;
    .locals 0

    iget-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService;->f:Lcom/astrob/turbodog/a/a$a;

    return-object p1
.end method

.method public onCreate()V
    .locals 2

    invoke-super {p0}, Landroid/app/Service;->onCreate()V

    invoke-static {}, Lcom/astrob/turbodog/e;->a()Lcom/astrob/turbodog/e;

    move-result-object v0

    invoke-virtual {v0, p0}, Lcom/astrob/turbodog/e;->a(Lcom/astrob/turbodog/d;)Z

    move-result v1

    if-nez v1, :cond_0

    iget-object v0, v0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0, p0}, Ljava/util/Vector;->add(Ljava/lang/Object;)Z

    :cond_0
    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object v0

    invoke-virtual {v0, p0}, Lcom/astrob/turbodog/c;->a(Lcom/astrob/turbodog/b;)Z

    move-result v1

    if-nez v1, :cond_1

    iget-object v0, v0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0, p0}, Ljava/util/Vector;->add(Ljava/lang/Object;)Z

    :cond_1
    return-void
.end method

.method public onDestroy()V
    .locals 2

    invoke-super {p0}, Landroid/app/Service;->onDestroy()V

    invoke-static {}, Lcom/astrob/turbodog/e;->a()Lcom/astrob/turbodog/e;

    move-result-object v0

    invoke-virtual {v0, p0}, Lcom/astrob/turbodog/e;->a(Lcom/astrob/turbodog/d;)Z

    move-result v1

    if-eqz v1, :cond_0

    iget-object v0, v0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0, p0}, Ljava/util/Vector;->remove(Ljava/lang/Object;)Z

    :cond_0
    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object v0

    invoke-virtual {v0, p0}, Lcom/astrob/turbodog/c;->a(Lcom/astrob/turbodog/b;)Z

    move-result v1

    if-eqz v1, :cond_1

    iget-object v0, v0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0, p0}, Ljava/util/Vector;->remove(Ljava/lang/Object;)Z

    :cond_1
    return-void
.end method
