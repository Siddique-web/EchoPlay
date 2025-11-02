from app import app, db, Video  # type: ignore

with app.app_context():
    videos = Video.query.all()
    print(f"Found {len(videos)} videos")
    
    for video in videos:
        print(f"ID: {video.id}")
        print(f"Title: {video.title}")
        print(f"Description: {video.description}")
        print(f"URL: {video.url}")
        print(f"Thumbnail: {video.thumbnail}")
        print(f"Uploaded by: {video.uploaded_by}")
        print("---")