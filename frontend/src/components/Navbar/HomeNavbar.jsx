import { AppBar, Toolbar, Typography, Button, Stack, Box, Container } from "@mui/material";
import {BookOpen} from 'lucide-react'; // Dùng icon từ thư viện lucide-react
import {Link} from 'react-router-dom';

export default function HomeNavber(){
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
                <Toolbar 
                disableGutters // Loại bỏ padding mặc định của Toolbar để khớp với Container
                sx={{ 
                    height: { xs: 64, md: 72 }, 
                    justifyContent: 'space-between' 
                }}> {/* Toolbar là thành phần con của AppBar, giúp căn chỉnh nội dung bên trong */}
                    
                    <Stack //Stack là một component của Material-UI giúp xếp chồng các phần tử theo chiều dọc hoặc ngang, ở đây dùng để xếp logo và tên ứng dụng theo hàng ngang, tương tự như flexbox trong CSS
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
                    {/* Action Buttons */}
                    <Stack direction="row" spacing={3}>
                        <Button 
                        variant="text" 
                        sx={{ color: '#4b4d53', fontWeight: 500, textTransform: 'none',fontSize: '18px',fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
                        >
                        Đăng nhập
                        </Button>
                        <Button 
                        variant="contained" 
                        sx={{ 
                            bgcolor: '#4f46e5', 
                            borderRadius: '10px', // Nút bo tròn hiện đại
                            fontWeight: 500, textTransform: 'none',fontSize: '18px',fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            px: 3,
                            py:1,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#4338ca' }
                        }}
                        >
                        Đăng ký
                        </Button>
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    )
}
