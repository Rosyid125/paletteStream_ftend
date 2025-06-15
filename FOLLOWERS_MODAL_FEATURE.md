# Followers Modal Feature Documentation

## Overview

Feature modal untuk menampilkan daftar followers dan following dari sebuah user profile, dengan functionalitas yang mirip dengan social media pada umumnya.

## Files Modified/Created

### 1. `src/components/FollowersModal.jsx` (NEW)

Komponen modal utama yang menampilkan daftar followers dan following dengan:

- **Tabs Navigation**: Switch antara "Followers" dan "Following"
- **Pagination**: Load more data dengan pagination support
- **Follow/Unfollow Actions**: Ability untuk follow/unfollow users langsung dari modal
- **User Navigation**: Click pada user untuk navigate ke profile mereka
- **Error Handling**: Proper error states dan retry mechanisms
- **Loading States**: Skeleton loading saat fetch data
- **Empty States**: Friendly messages ketika tidak ada data

### 2. `src/pages/Profile.jsx` (MODIFIED)

Profile page yang sudah dimodifikasi untuk mengintegrasikan modal:

- **Clickable Followers/Following Counts**: Click pada angka followers/following untuk buka modal
- **Modal State Management**: State untuk control modal visibility dan tab selection
- **Event Handlers**: Functions untuk handle modal opening dengan tab yang tepat

## API Integration

Modal ini menggunakan endpoint API berikut sesuai dengan dokumentasi yang diberikan:

### Followers Endpoint

```
GET /api/user-follows/:userId/followers?page=1&limit=20
```

### Following Endpoint

```
GET /api/user-follows/:userId/following?page=1&limit=20
```

### Follow/Unfollow Endpoint

```
POST /api/follows/create-delete/:targetUserId
```

## Features

### 1. **Responsive Design**

- Modal yang responsive untuk mobile dan desktop
- Proper spacing dan touch-friendly buttons
- ScrollArea untuk handle long lists

### 2. **User Experience**

- **Hover Effects**: Visual feedback pada interactive elements
- **Loading States**: Skeleton loading untuk better UX
- **Error Recovery**: Retry button pada error states
- **Empty States**: Informative messages ketika tidak ada data
- **Real-time Updates**: Follow/unfollow actions update immediately

### 3. **Navigation Integration**

- Click pada user avatar/name untuk navigate ke profile mereka
- Modal automatically closes saat navigate
- Proper browser history management

### 4. **Performance**

- **Pagination**: Load data in chunks (20 items per page)
- **Lazy Loading**: Only fetch data when tab is active
- **State Cleanup**: Reset states when modal closes
- **Memory Management**: Proper cleanup pada unmount

## Usage

### Opening Modal Programmatically

```jsx
// Open followers tab
handleOpenFollowersModal("followers");

// Open following tab
handleOpenFollowersModal("following");
```

### Modal Props

```jsx
<FollowersModal isOpen={isFollowersModalOpen} onClose={() => setIsFollowersModalOpen(false)} userId={userId} userProfile={userProfile} initialTab={followersModalTab} />
```

## Component Structure

```
FollowersModal/
├── Dialog (Modal Container)
├── DialogHeader (Title with user info)
├── Tabs (Followers/Following tabs)
│   ├── TabsList (Tab buttons with counts)
│   ├── TabsContent (Followers)
│   │   ├── ScrollArea (List container)
│   │   ├── UserItem[] (Individual user cards)
│   │   └── Pagination (Load more controls)
│   └── TabsContent (Following)
│       ├── ScrollArea (List container)
│       ├── UserItem[] (Individual user cards)
│       └── Pagination (Load more controls)
```

## User Item Features

Setiap user item dalam list memiliki:

- **Avatar**: User profile picture dengan fallback
- **User Info**: Display name, username, bio (jika ada)
- **Follow Date**: Kapan user di-follow/follow
- **Action Buttons**: Follow/Unfollow (jika bukan current user)
- **Click Navigation**: Click untuk ke profile user

## Error Handling

Modal menangani berbagai error scenarios:

- **Network Errors**: API call failures
- **Authentication Errors**: Invalid or expired tokens
- **Permission Errors**: Access denied scenarios
- **Data Errors**: Invalid or corrupted response data

## Styling

Modal menggunakan:

- **shadcn/ui Components**: Dialog, Tabs, ScrollArea, Button, etc.
- **Tailwind CSS**: For styling dan responsive design
- **Consistent Design System**: Matching dengan design system app
- **Dark Mode Support**: Automatic dark/light mode support

## Future Enhancements

Possible improvements yang bisa ditambahkan:

1. **Search Functionality**: Search within followers/following
2. **Filters**: Filter by follow date, mutual follows, etc.
3. **Bulk Actions**: Select multiple users untuk bulk follow/unfollow
4. **Export Features**: Export followers/following list
5. **Analytics**: Show mutual followers, follow back rate, etc.
6. **Infinite Scroll**: Replace pagination dengan infinite scroll
7. **Real-time Updates**: WebSocket integration untuk real-time updates

## Testing

Untuk test modal ini:

1. Open profile page dengan user yang memiliki followers/following
2. Click pada angka "Followers" atau "Following"
3. Verify modal opens dengan tab yang benar
4. Test pagination untuk load more data
5. Test follow/unfollow functionality
6. Test navigation ke user profiles
7. Test error scenarios (network issues, etc.)

## Dependencies

Modal ini membutuhkan:

- `react-router-dom` untuk navigation
- `@radix-ui/react-*` components (melalui shadcn/ui)
- `lucide-react` untuk icons
- Custom API instance dan auth context
- Tailwind CSS untuk styling
