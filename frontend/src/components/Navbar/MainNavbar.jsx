import {AppBar, Toolbar, Typography, Button, Stack, Box, Container, InputBase, Badge, Avatar, IconButton} from '@mui/material';
import {BookOpen, Search, Home, Users, Bell, ChevronDown} from 'lucide-react'; // Dùng icon từ thư viện lucide-react;
import {Link} from 'react-router-dom';

export default function MainNavbar({currentUser}){
    return(
        <AppBar 
        position="fixed"  // Giữ navbar cố định ở đầu trang
        elevation={0} // Tắt bóng mặc định của MUI
        sx={{ 
            bgcolor: 'white', 
            // Tạo đổ bóng nhẹ nhàng chuẩn UI hiện đại
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            zIndex: (theme) => theme.zIndex.drawer + 1
        }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters // Loại bỏ padding mặc định của Toolbar để khớp với Container
                sx={{ 
                    height: { xs: 64, md: 72 }, 
                    justifyContent: 'space-between' 
                }}>
                    {/* 1. Logo */}
                    <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={1.5} 
                    component={Link} 
                    to="/" 
                    sx={{ textDecoration: 'none' }}>
                        <Box 
                        sx={{ 
                        width: '40px', height: '40px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(to bottom right, #4f46e5, #3b82f6)', // From indigo-600 to blue-500
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                        }}>
                            <BookOpen size={24} color="white" /> {/* BookOpen: Icon sách mở, màu trắng để nổi bật trên nền gradient */}
                        </Box>
                        <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 700, 
                            color: '#111827', // text-gray-900
                            fontSize: '28px'
                        }}
                        >
                        StudyNet
                        </Typography>
                    </Stack>

                    {/* 2. Navigation Tabs (Bảng tin, Nhóm học tập) */}
                    <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                        <Button
                        startIcon={<Home size={20} />}
                        sx={{
                            textTransform: 'none', fontWeight: 500, fontSize: '18px',fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', borderRadius: '12px', px: 2,
                            bgcolor: '#eff6ff', color: '#2563eb', // Trạng thái Active 
                            '&:hover': { bgcolor: '#dbeafe' }
                        }}
                        >
                        Bảng tin
                        </Button>
                        <Button
                        startIcon={<Users size={20} />}
                        sx={{
                            textTransform: 'none', fontWeight: 500, borderRadius: '12px', px: 2,fontSize: '18px',fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            color: '#64748b',
                            '&:hover': { bgcolor: '#f8fafc' }
                        }}
                        >
                        Nhóm học tập
                        </Button>
                    </Stack>

                    {/* 3. Search Bar */}
                    <Box sx={{ 
                        flexGrow: 1, display: 'flex', justifyContent: 'center', px: 4 
                    }}>
                        <Box sx={{ 
                        display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', 
                        borderRadius: '100px', px: 2, py: 0.5, width: '100%', maxWidth: '500px'
                        }}>
                        <Search size={18} color="#94a3b8" />
                        <InputBase 
                            placeholder="Tìm kiếm bài viết, tài liệu, nhóm..." 
                            sx={{ ml: 1, flex: 1, color: '#1e293b',textTransform: 'none',fontSize: '18px',fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }} 
                        />
                        </Box>
                    </Box>
                    
                    {/* 4. Action Icons & Profile */}
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <IconButton sx={{ bgcolor: '#f1f5f9' }}>
                        <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 12, height: 16, minWidth: 16 } }}>
                            <Bell size={24} color="#475569" />
                        </Badge>
                        </IconButton>

                        <Stack 
                        direction="row" alignItems="center" spacing={1} 
                        sx={{ cursor: 'pointer', p: '4px 8px', borderRadius: '100px', '&:hover': { bgcolor: '#f8fafc' } }}
                        >
                        <Avatar 
                            src={currentUser?.avatar} 
                            sx={{ width: 36, height: 36, border: '2px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }} 
                        />
                        <Typography sx={{ fontWeight: 500, textTransform: 'none',fontSize: '18px',fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#334155', display: { xs: 'none', sm: 'block' } }}>
                            {currentUser?.name || 'Nguyễn Văn An'}
                        </Typography>
                        <ChevronDown size={20} color="#64748b" />
                        </Stack>
                    </Stack>

                </Toolbar>
            </Container>
        </AppBar>
    );
}