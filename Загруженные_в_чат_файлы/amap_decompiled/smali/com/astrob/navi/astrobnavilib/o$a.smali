.class final Lcom/astrob/navi/astrobnavilib/o$a;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/media/AudioManager$OnAudioFocusChangeListener;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/o;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x8
    name = "a"
.end annotation


# direct methods
.method private constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method synthetic constructor <init>(B)V
    .locals 0

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/o$a;-><init>()V

    return-void
.end method


# virtual methods
.method public final onAudioFocusChange(I)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->handleAudioTrackFocusChanged(I)V

    return-void
.end method
