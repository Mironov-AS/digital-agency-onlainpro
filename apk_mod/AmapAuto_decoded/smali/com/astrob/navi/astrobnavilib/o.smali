.class public final Lcom/astrob/navi/astrobnavilib/o;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/astrob/navi/astrobnavilib/o$a;
    }
.end annotation


# static fields
.field private static a:Ljava/lang/String; = "TTSManager"

.field private static b:Landroid/media/AudioTrack; = null

.field private static c:I = 0x0

.field private static d:Z = false

.field private static e:Z = false

.field private static f:Z = false

.field private static g:Landroid/media/AudioManager; = null

.field private static h:I = 0x0

.field private static i:I = -0x1

.field private static j:I = 0x0

.field private static k:Ljava/lang/String; = null

.field private static l:Ljava/lang/String; = "/Voice/SpeedAlert.wav"

.field private static m:Landroid/media/AudioTrack;

.field private static n:[B

.field private static o:I

.field private static p:[B

.field private static q:Lcom/astrob/navi/astrobnavilib/o$a;

.field private static r:Landroid/speech/tts/TextToSpeech;


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method public static a([BI)I
    .locals 7

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    if-eqz v0, :cond_6

    sget-boolean v0, Lcom/astrob/navi/astrobnavilib/o;->d:Z

    if-nez v0, :cond_0

    goto :goto_3

    :cond_0
    sget v0, Lcom/astrob/navi/astrobnavilib/o;->c:I

    const/4 v1, 0x0

    if-ge p1, v0, :cond_1

    move v2, p1

    goto :goto_0

    :cond_1
    move v2, v0

    :goto_0
    const/4 v0, 0x0

    :cond_2
    :goto_1
    if-lez p1, :cond_5

    sget-boolean v3, Lcom/astrob/navi/astrobnavilib/o;->e:Z

    if-nez v3, :cond_5

    sget-boolean v3, Lcom/astrob/navi/astrobnavilib/o;->d:Z

    if-eqz v3, :cond_5

    sget-object v3, Lcom/astrob/navi/astrobnavilib/o;->p:[B

    invoke-static {p0, v0, v3, v1, v2}, Ljava/lang/System;->arraycopy(Ljava/lang/Object;ILjava/lang/Object;II)V

    sget-object v3, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    sget-object v4, Lcom/astrob/navi/astrobnavilib/o;->p:[B

    invoke-virtual {v3, v4, v1, v2}, Landroid/media/AudioTrack;->write([BII)I

    move-result v3

    if-gtz v3, :cond_3

    const-string p0, "TTSManager"

    const-string p1, "AudioTrack write error, nWrite="

    invoke-static {v3}, Ljava/lang/String;->valueOf(I)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p1, v0}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    invoke-static {p0, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    goto :goto_2

    :cond_3
    if-eq v3, v2, :cond_4

    const-string v4, "TTSManager"

    new-instance v5, Ljava/lang/StringBuilder;

    const-string v6, "AudioTrack write nWrite="

    invoke-direct {v5, v6}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v5, v3}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v3, ", nCopyLen="

    invoke-virtual {v5, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v5, v2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v5}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v4, v2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :cond_4
    sget v2, Lcom/astrob/navi/astrobnavilib/o;->c:I

    add-int/2addr v0, v2

    sub-int/2addr p1, v2

    if-ge p1, v2, :cond_2

    move v2, p1

    goto :goto_1

    :cond_5
    :goto_2
    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    invoke-virtual {p0}, Landroid/media/AudioTrack;->flush()V

    const/4 p0, 0x1

    return p0

    :cond_6
    :goto_3
    const/4 p0, -0x1

    return p0
.end method

.method public static a()V
    .locals 2

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Landroid/media/AudioTrack;->stop()V

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    invoke-virtual {v0}, Landroid/media/AudioTrack;->release()V

    sput-object v1, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    :cond_0
    const/4 v0, 0x0

    sput-boolean v0, Lcom/astrob/navi/astrobnavilib/o;->d:Z

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->m:Landroid/media/AudioTrack;

    if-eqz v0, :cond_1

    invoke-virtual {v0}, Landroid/media/AudioTrack;->stop()V

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->m:Landroid/media/AudioTrack;

    invoke-virtual {v0}, Landroid/media/AudioTrack;->release()V

    sput-object v1, Lcom/astrob/navi/astrobnavilib/o;->m:Landroid/media/AudioTrack;

    :cond_1
    sput-object v1, Lcom/astrob/navi/astrobnavilib/o;->q:Lcom/astrob/navi/astrobnavilib/o$a;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->r:Landroid/speech/tts/TextToSpeech;

    if-eqz v0, :cond_2

    invoke-virtual {v0}, Landroid/speech/tts/TextToSpeech;->shutdown()V

    :cond_2
    return-void
.end method

.method public static a(II)V
    .locals 2

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    if-nez v0, :cond_0

    return-void

    :cond_0
    sget v1, Lcom/astrob/navi/astrobnavilib/o;->h:I

    mul-int v1, v1, p0

    div-int/2addr v1, p1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p0

    iget-object p0, p0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getVolumeStreamType()I

    move-result p0

    const/4 p1, 0x0

    invoke-virtual {v0, p0, v1, p1}, Landroid/media/AudioManager;->setStreamVolume(III)V

    return-void
.end method

.method public static a(Landroid/content/Context;Ljava/lang/String;)V
    .locals 2

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    if-nez v0, :cond_0

    const-string v0, "audio"

    invoke-virtual {p0, v0}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/media/AudioManager;

    sput-object v0, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getVolumeStreamType()I

    move-result v0

    sget-object v1, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    invoke-virtual {v1, v0}, Landroid/media/AudioManager;->getStreamMaxVolume(I)I

    move-result v0

    sput v0, Lcom/astrob/navi/astrobnavilib/o;->h:I

    :cond_0
    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->q:Lcom/astrob/navi/astrobnavilib/o$a;

    if-nez v0, :cond_1

    new-instance v0, Lcom/astrob/navi/astrobnavilib/o$a;

    const/4 v1, 0x0

    invoke-direct {v0, v1}, Lcom/astrob/navi/astrobnavilib/o$a;-><init>(B)V

    sput-object v0, Lcom/astrob/navi/astrobnavilib/o;->q:Lcom/astrob/navi/astrobnavilib/o$a;

    :cond_1
    sput-object p1, Lcom/astrob/navi/astrobnavilib/o;->k:Ljava/lang/String;

    new-instance p1, Ljava/lang/StringBuilder;

    invoke-direct {p1}, Ljava/lang/StringBuilder;-><init>()V

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->k:Ljava/lang/String;

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->l:Ljava/lang/String;

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    sput-object p1, Lcom/astrob/navi/astrobnavilib/o;->k:Ljava/lang/String;

    new-instance p1, Landroid/speech/tts/TextToSpeech;

    new-instance v0, Lcom/astrob/navi/astrobnavilib/o$1;

    invoke-direct {v0}, Lcom/astrob/navi/astrobnavilib/o$1;-><init>()V

    invoke-direct {p1, p0, v0}, Landroid/speech/tts/TextToSpeech;-><init>(Landroid/content/Context;Landroid/speech/tts/TextToSpeech$OnInitListener;)V

    sput-object p1, Lcom/astrob/navi/astrobnavilib/o;->r:Landroid/speech/tts/TextToSpeech;

    return-void
.end method

.method public static a(Ljava/lang/String;)V
    .locals 3

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->r:Landroid/speech/tts/TextToSpeech;

    if-eqz v0, :cond_0

    const/4 v1, 0x1

    const/4 v2, 0x0

    invoke-virtual {v0, p0, v1, v2, v2}, Landroid/speech/tts/TextToSpeech;->speak(Ljava/lang/CharSequence;ILandroid/os/Bundle;Ljava/lang/String;)I

    :cond_0
    return-void
.end method

.method public static a(I)Z
    .locals 13

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getNaviTtsStreamType()I

    move-result v0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v1

    iget-object v1, v1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v1}, Lcom/astrob/navi/astrobnavilib/j;->requestAudio4Play()Z

    move-result v8

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v1

    iget-object v1, v1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v1}, Lcom/astrob/navi/astrobnavilib/j;->useAudioTrackBuilder()Z

    move-result v1

    const/4 v9, 0x1

    sput-boolean v9, Lcom/astrob/navi/astrobnavilib/o;->d:Z

    sget-object v2, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    const/4 v10, 0x3

    const/4 v11, 0x0

    if-eqz v2, :cond_4

    sget v3, Lcom/astrob/navi/astrobnavilib/o;->j:I

    if-ne v3, p0, :cond_3

    sget-boolean p0, Lcom/astrob/navi/astrobnavilib/o;->f:Z

    if-nez p0, :cond_2

    sput-boolean v9, Lcom/astrob/navi/astrobnavilib/o;->f:Z

    if-eqz v8, :cond_0

    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    sget-object v1, Lcom/astrob/navi/astrobnavilib/o;->q:Lcom/astrob/navi/astrobnavilib/o$a;

    invoke-virtual {p0, v1, v0, v10}, Landroid/media/AudioManager;->requestAudioFocus(Landroid/media/AudioManager$OnAudioFocusChangeListener;II)I

    move-result p0

    goto :goto_0

    :cond_0
    const/4 p0, 0x1

    :goto_0
    if-ne v9, p0, :cond_1

    const-wide/16 v0, 0xc8

    :try_start_0
    invoke-static {v0, v1}, Ljava/lang/Thread;->sleep(J)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_1

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/Exception;->printStackTrace()V

    :goto_1
    :try_start_1
    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    invoke-virtual {p0}, Landroid/media/AudioTrack;->play()V
    :try_end_1
    .catch Ljava/lang/IllegalStateException; {:try_start_1 .. :try_end_1} :catch_1

    return v9

    :catch_1
    move-exception p0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/o;->b()V

    invoke-virtual {p0}, Ljava/lang/IllegalStateException;->printStackTrace()V

    return v11

    :cond_1
    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->a:Ljava/lang/String;

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "requestAudioFocus with streamType="

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v0, " failed!"

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {p0, v0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->q:Lcom/astrob/navi/astrobnavilib/o$a;

    invoke-virtual {p0, v0}, Landroid/media/AudioManager;->abandonAudioFocus(Landroid/media/AudioManager$OnAudioFocusChangeListener;)I

    sput-boolean v11, Lcom/astrob/navi/astrobnavilib/o;->d:Z

    sput-boolean v11, Lcom/astrob/navi/astrobnavilib/o;->f:Z

    return v11

    :cond_2
    return v9

    :cond_3
    invoke-virtual {v2}, Landroid/media/AudioTrack;->stop()V

    sget-object v2, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    invoke-virtual {v2}, Landroid/media/AudioTrack;->release()V

    const/4 v2, 0x0

    sput-object v2, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    :cond_4
    const/4 v2, 0x4

    const/4 v3, 0x2

    invoke-static {p0, v2, v3}, Landroid/media/AudioTrack;->getMinBufferSize(III)I

    move-result v4

    sput v4, Lcom/astrob/navi/astrobnavilib/o;->c:I

    const/4 v5, -0x2

    if-eq v4, v5, :cond_9

    sget v4, Lcom/astrob/navi/astrobnavilib/o;->c:I

    const/4 v5, -0x1

    if-ne v4, v5, :cond_5

    goto/16 :goto_4

    :cond_5
    mul-int/lit8 v4, v4, 0x2

    sput v4, Lcom/astrob/navi/astrobnavilib/o;->c:I

    if-eqz v1, :cond_6

    :try_start_2
    new-instance v1, Landroid/media/AudioTrack$Builder;

    invoke-direct {v1}, Landroid/media/AudioTrack$Builder;-><init>()V

    new-instance v4, Landroid/media/AudioAttributes$Builder;

    invoke-direct {v4}, Landroid/media/AudioAttributes$Builder;-><init>()V

    invoke-virtual {v4, v0}, Landroid/media/AudioAttributes$Builder;->setUsage(I)Landroid/media/AudioAttributes$Builder;

    move-result-object v4

    invoke-virtual {v4, v3}, Landroid/media/AudioAttributes$Builder;->setContentType(I)Landroid/media/AudioAttributes$Builder;

    move-result-object v4

    invoke-virtual {v4}, Landroid/media/AudioAttributes$Builder;->build()Landroid/media/AudioAttributes;

    move-result-object v4

    invoke-virtual {v1, v4}, Landroid/media/AudioTrack$Builder;->setAudioAttributes(Landroid/media/AudioAttributes;)Landroid/media/AudioTrack$Builder;

    move-result-object v1

    new-instance v4, Landroid/media/AudioFormat$Builder;

    invoke-direct {v4}, Landroid/media/AudioFormat$Builder;-><init>()V

    invoke-virtual {v4, v3}, Landroid/media/AudioFormat$Builder;->setEncoding(I)Landroid/media/AudioFormat$Builder;

    move-result-object v3

    invoke-virtual {v3, p0}, Landroid/media/AudioFormat$Builder;->setSampleRate(I)Landroid/media/AudioFormat$Builder;

    move-result-object v3

    invoke-virtual {v3, v2}, Landroid/media/AudioFormat$Builder;->setChannelMask(I)Landroid/media/AudioFormat$Builder;

    move-result-object v2

    invoke-virtual {v2}, Landroid/media/AudioFormat$Builder;->build()Landroid/media/AudioFormat;

    move-result-object v2

    invoke-virtual {v1, v2}, Landroid/media/AudioTrack$Builder;->setAudioFormat(Landroid/media/AudioFormat;)Landroid/media/AudioTrack$Builder;

    move-result-object v1

    invoke-virtual {v1, v9}, Landroid/media/AudioTrack$Builder;->setTransferMode(I)Landroid/media/AudioTrack$Builder;

    move-result-object v1

    sget v2, Lcom/astrob/navi/astrobnavilib/o;->c:I

    invoke-virtual {v1, v2}, Landroid/media/AudioTrack$Builder;->setBufferSizeInBytes(I)Landroid/media/AudioTrack$Builder;

    move-result-object v1

    invoke-virtual {v1}, Landroid/media/AudioTrack$Builder;->build()Landroid/media/AudioTrack;

    move-result-object v1

    sput-object v1, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    goto :goto_2

    :cond_6
    new-instance v12, Landroid/media/AudioTrack;

    const/4 v4, 0x4

    const/4 v5, 0x2

    sget v6, Lcom/astrob/navi/astrobnavilib/o;->c:I

    const/4 v7, 0x1

    move-object v1, v12

    move v2, v0

    move v3, p0

    invoke-direct/range {v1 .. v7}, Landroid/media/AudioTrack;-><init>(IIIIII)V

    sput-object v12, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    :goto_2
    sget v1, Lcom/astrob/navi/astrobnavilib/o;->c:I

    new-array v1, v1, [B

    sput-object v1, Lcom/astrob/navi/astrobnavilib/o;->p:[B
    :try_end_2
    .catch Ljava/lang/IllegalArgumentException; {:try_start_2 .. :try_end_2} :catch_3

    if-eqz v8, :cond_7

    sget-object v1, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    sget-object v2, Lcom/astrob/navi/astrobnavilib/o;->q:Lcom/astrob/navi/astrobnavilib/o$a;

    invoke-virtual {v1, v2, v0, v10}, Landroid/media/AudioManager;->requestAudioFocus(Landroid/media/AudioManager$OnAudioFocusChangeListener;II)I

    move-result v1

    goto :goto_3

    :cond_7
    const/4 v1, 0x1

    :goto_3
    if-eq v9, v1, :cond_8

    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->a:Ljava/lang/String;

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "requestAudioFocus with streamType="

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v0, " failed!"

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {p0, v0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->q:Lcom/astrob/navi/astrobnavilib/o$a;

    invoke-virtual {p0, v0}, Landroid/media/AudioManager;->abandonAudioFocus(Landroid/media/AudioManager$OnAudioFocusChangeListener;)I

    sput-boolean v11, Lcom/astrob/navi/astrobnavilib/o;->d:Z

    return v11

    :cond_8
    sput p0, Lcom/astrob/navi/astrobnavilib/o;->j:I

    :try_start_3
    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    invoke-virtual {p0}, Landroid/media/AudioTrack;->play()V
    :try_end_3
    .catch Ljava/lang/IllegalStateException; {:try_start_3 .. :try_end_3} :catch_2

    return v9

    :catch_2
    move-exception p0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/o;->b()V

    invoke-virtual {p0}, Ljava/lang/IllegalStateException;->printStackTrace()V

    return v11

    :catch_3
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalArgumentException;->printStackTrace()V

    :cond_9
    :goto_4
    return v11
.end method

.method public static b(I)I
    .locals 0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/o;->b()V

    return p0
.end method

.method public static b()V
    .locals 2

    const/4 v0, 0x0

    sput-boolean v0, Lcom/astrob/navi/astrobnavilib/o;->d:Z

    sput-boolean v0, Lcom/astrob/navi/astrobnavilib/o;->f:Z

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->b:Landroid/media/AudioTrack;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Landroid/media/AudioTrack;->stop()V

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->g:Landroid/media/AudioManager;

    sget-object v1, Lcom/astrob/navi/astrobnavilib/o;->q:Lcom/astrob/navi/astrobnavilib/o$a;

    invoke-virtual {v0, v1}, Landroid/media/AudioManager;->abandonAudioFocus(Landroid/media/AudioManager$OnAudioFocusChangeListener;)I

    :cond_0
    return-void
.end method

.method public static c(I)V
    .locals 4

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->r:Landroid/speech/tts/TextToSpeech;

    if-nez v0, :cond_0

    return-void

    :cond_0
    packed-switch p0, :pswitch_data_0

    :pswitch_0
    new-instance p0, Ljava/util/Locale;

    const-string v0, "en"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto/16 :goto_0

    :pswitch_1
    new-instance p0, Ljava/util/Locale;

    const-string v0, "he"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto/16 :goto_0

    :pswitch_2
    new-instance p0, Ljava/util/Locale;

    const-string v0, "fa"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto/16 :goto_0

    :pswitch_3
    new-instance p0, Ljava/util/Locale;

    const-string v0, "ar"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto/16 :goto_0

    :pswitch_4
    new-instance p0, Ljava/util/Locale;

    const-string v0, "ru"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto/16 :goto_0

    :pswitch_5
    new-instance p0, Ljava/util/Locale;

    const-string v0, "th"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto/16 :goto_0

    :pswitch_6
    new-instance p0, Ljava/util/Locale;

    const-string v0, "da"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto/16 :goto_0

    :pswitch_7
    new-instance p0, Ljava/util/Locale;

    const-string v0, "zh"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto/16 :goto_0

    :pswitch_8
    new-instance p0, Ljava/util/Locale;

    const-string v0, "pt"

    const-string v1, "BR"

    invoke-direct {p0, v0, v1}, Ljava/util/Locale;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    goto :goto_0

    :pswitch_9
    new-instance p0, Ljava/util/Locale;

    const-string v0, "el"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_a
    new-instance p0, Ljava/util/Locale;

    const-string v0, "fi"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_b
    new-instance p0, Ljava/util/Locale;

    const-string v0, "pt"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_c
    new-instance p0, Ljava/util/Locale;

    const-string v0, "sv"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_d
    new-instance p0, Ljava/util/Locale;

    const-string v0, "pl"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_e
    new-instance p0, Ljava/util/Locale;

    const-string v0, "nl"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_f
    new-instance p0, Ljava/util/Locale;

    const-string v0, "es"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_10
    new-instance p0, Ljava/util/Locale;

    const-string v0, "it"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_11
    new-instance p0, Ljava/util/Locale;

    const-string v0, "de"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_12
    new-instance p0, Ljava/util/Locale;

    const-string v0, "fr"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    goto :goto_0

    :pswitch_13
    new-instance p0, Ljava/util/Locale;

    const-string v0, "en"

    const-string v1, "US"

    invoke-direct {p0, v0, v1}, Ljava/util/Locale;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    goto :goto_0

    :pswitch_14
    new-instance p0, Ljava/util/Locale;

    const-string v0, "en"

    invoke-direct {p0, v0}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    :goto_0
    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->r:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v0, p0}, Landroid/speech/tts/TextToSpeech;->setLanguage(Ljava/util/Locale;)I

    move-result v0

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {p0}, Ljava/util/Locale;->getLanguage()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v2, "_"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p0}, Ljava/util/Locale;->getCountry()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v2, " ["

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p0}, Ljava/util/Locale;->getDisplayName()Ljava/lang/String;

    move-result-object p0

    invoke-virtual {v1, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p0, "]"

    invoke-virtual {v1, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    const/4 v1, -0x1

    if-eq v1, v0, :cond_2

    const/4 v1, -0x2

    if-ne v1, v0, :cond_1

    goto :goto_1

    :cond_1
    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->a:Ljava/lang/String;

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "android tts: set <"

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v1, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p0, "> ok"

    invoke-virtual {v1, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    invoke-static {v0, p0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :cond_2
    :goto_1
    sget-object v1, Lcom/astrob/navi/astrobnavilib/o;->a:Ljava/lang/String;

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "{android tts: set <"

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v2, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p0, "> fail("

    invoke-virtual {v2, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string p0, ")"

    invoke-virtual {v2, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    invoke-static {v1, p0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->r:Landroid/speech/tts/TextToSpeech;

    sget-object v0, Ljava/util/Locale;->ENGLISH:Ljava/util/Locale;

    invoke-virtual {p0, v0}, Landroid/speech/tts/TextToSpeech;->setLanguage(Ljava/util/Locale;)I

    move-result p0

    if-gez p0, :cond_3

    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->a:Ljava/lang/String;

    const-string v0, "android tts: set <English> fail}"

    invoke-static {p0, v0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :cond_3
    sget-object p0, Lcom/astrob/navi/astrobnavilib/o;->a:Ljava/lang/String;

    const-string v0, "android tts: set <English> ok}"

    invoke-static {p0, v0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :pswitch_data_0
    .packed-switch 0x0
        :pswitch_14
        :pswitch_13
        :pswitch_12
        :pswitch_11
        :pswitch_10
        :pswitch_f
        :pswitch_e
        :pswitch_d
        :pswitch_c
        :pswitch_b
        :pswitch_a
        :pswitch_9
        :pswitch_8
        :pswitch_7
        :pswitch_6
        :pswitch_5
        :pswitch_0
        :pswitch_4
        :pswitch_0
        :pswitch_0
        :pswitch_3
        :pswitch_2
        :pswitch_0
        :pswitch_1
    .end packed-switch
.end method

.method public static c()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method

.method static synthetic d()Ljava/lang/String;
    .locals 1

    sget-object v0, Lcom/astrob/navi/astrobnavilib/o;->a:Ljava/lang/String;

    return-object v0
.end method
