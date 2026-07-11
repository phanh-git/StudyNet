package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.model.Comment;
import com.gr1.studynet_backend.model.Group;
import com.gr1.studynet_backend.model.GroupMember;
import com.gr1.studynet_backend.model.Notification;
import com.gr1.studynet_backend.model.Post;
import com.gr1.studynet_backend.model.Reaction;
import com.gr1.studynet_backend.model.Subject;
import com.gr1.studynet_backend.model.User;
import com.gr1.studynet_backend.repository.CommentRepository;
import com.gr1.studynet_backend.repository.GroupMemberRepository;
import com.gr1.studynet_backend.repository.GroupRepository;
import com.gr1.studynet_backend.repository.NotificationRepository;
import com.gr1.studynet_backend.repository.PostRepository;
import com.gr1.studynet_backend.repository.ReactionRepository;
import com.gr1.studynet_backend.repository.SubjectRepository;
import com.gr1.studynet_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SampleDataService implements CommandLineRunner {
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final PostRepository postRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        appendDemoData();
    }

    public void seedIfNeeded() {
        if (subjectRepository.count() == 0) {
            List<Subject> subjects = List.of(
                createSubject("Toán học", "MATH"),
                createSubject("Vật lý", "PHYS"),
                createSubject("Hóa học", "CHEM"),
                createSubject("Lập trình", "CS"),
                createSubject("Tiếng Anh", "ENG")
            );
            subjectRepository.saveAll(subjects);
        }

        repairExistingData();

        if (userRepository.count() > 0 || postRepository.count() > 0) {
            return;
        }

        List<Subject> subjects = subjectRepository.findAll();
        Subject math = subjects.stream().filter(subject -> "MATH".equals(subject.getCode())).findFirst().orElse(subjects.get(0));
        Subject programming = subjects.stream().filter(subject -> "CS".equals(subject.getCode())).findFirst().orElse(subjects.get(0));
        Subject physics = subjects.stream().filter(subject -> "PHYS".equals(subject.getCode())).findFirst().orElse(subjects.get(0));

        User admin = createUser("Admin StudyNet", "admin@studynet.com", "Đại học Quốc gia TP.HCM", "Quản trị hệ thống", "ADMIN", "12345678");
        User studentOne = createUser("Nguyễn Văn An", "an@studynet.com", "ĐH Bách Khoa Hà Nội", "Khoa học máy tính", "USER", "12345678");
        User studentTwo = createUser("Trần Thị Bình", "binh@studynet.com", "ĐH Khoa học Tự nhiên", "Sư phạm Hóa", "USER", "12345678");
        User studentThree = createUser("Lê Hoàng Nam", "nam@studynet.com", "ĐH Sư phạm Kỹ thuật", "Kỹ thuật điện", "USER", "12345678");
        userRepository.saveAll(List.of(admin, studentOne, studentTwo, studentThree));

        Group programmingGroup = createGroup("Cộng đồng Lập trình Java", "Nơi chia sẻ bài tập, thuật toán và mẹo Spring Boot.", studentOne, programming);
        Group physicsGroup = createGroup("Ôn tập Vật lý đại cương", "Thảo luận công thức, bài tập và mẹo thi giữa kỳ.", studentThree, physics);
        Group mathGroup = createGroup("Giải tích cùng tiến", "Nhóm học giải tích, đại số tuyến tính và xác suất.", studentOne, math);
        groupRepository.saveAll(List.of(programmingGroup, physicsGroup, mathGroup));

        groupMemberRepository.saveAll(List.of(
            createGroupMember(studentOne, programmingGroup, "GROUP_ADMIN"),
            createGroupMember(studentOne, mathGroup, "GROUP_ADMIN"),
            createGroupMember(studentTwo, programmingGroup, "MEMBER"),
            createGroupMember(studentTwo, mathGroup, "MEMBER"),
            createGroupMember(studentOne, physicsGroup, "MEMBER"),
            createGroupMember(studentThree, programmingGroup, "MEMBER"),
            createGroupMember(studentThree, physicsGroup, "GROUP_ADMIN")
        ));

        Post postOne = createPost(
            studentOne,
            programmingGroup,
            programming,
            "MATERIAL",
            "Mình vừa tổng hợp bộ ghi chú Spring Boot Authentication cơ bản. Nếu mọi người muốn, mình sẽ đăng cả sơ đồ luồng login/register."
        );
        Post postTwo = createPost(
            studentTwo,
            null,
            math,
            "QUESTION",
            "Ai có tài liệu ôn xác suất thống kê dễ hiểu không? Mình đang cần ví dụ bài tập có lời giải chi tiết."
        );
        Post postThree = createPost(
            studentThree,
            physicsGroup,
            physics,
            "DISCUSSION",
            "Mình chia sẻ file tóm tắt chương Dao động điều hòa, ai cần mình gửi bản PDF trong nhóm nhé."
        );
        Post postFour = createPost(
            studentOne,
            null,
            programming,
            "ANNOUNCEMENT",
            "Nhóm Java sẽ có buổi chia sẻ mini về Spring Security vào tối thứ 7. Bạn nào quan tâm có thể để lại bình luận."
        );
        postRepository.saveAll(List.of(postOne, postTwo, postThree, postFour));

        reactionRepository.saveAll(List.of(
            createReaction(postOne, studentTwo, "LIKE"),
            createReaction(postOne, studentThree, "HEART"),
            createReaction(postTwo, studentOne, "LIKE"),
            createReaction(postThree, studentOne, "WOW")
        ));

        commentRepository.saveAll(List.of(
            createComment(postOne, studentTwo, "Có nhé, bạn đăng lên đi. Nhóm mình đang cần đúng chủ đề này."),
            createComment(postTwo, studentOne, "Mình có bộ đề xác suất, lát nữa mình gửi bạn trong inbox."),
            createComment(postThree, studentTwo, "Nếu được bạn up luôn phần bài tập mẫu thì tuyệt vời.")
        ));

    }

    public void appendDemoData() {
        seedIfNeeded();

        Subject math = findSubject("MATH");
        Subject chemistry = findSubject("CHEM");
        Subject english = findSubject("ENG");
        Subject programming = findSubject("CS");
        Subject physics = findSubject("PHYS");

        User an = findUser("an@studynet.com");
        User binh = findUser("binh@studynet.com");
        User nam = findUser("nam@studynet.com");

        User huong = ensureUser("Phạm Thu Hương", "huong@studynet.com", "ĐH Kinh tế Quốc dân", "Tiếng Anh thương mại", "USER", "12345678");
        User minh = ensureUser("Đỗ Quang Minh", "minh@studynet.com", "ĐH Bách Khoa Đà Nẵng", "Kỹ thuật hóa học", "USER", "12345678");
        User lan = ensureUser("Vũ Hải Lan", "lan@studynet.com", "ĐH Ngoại thương", "Tài chính quốc tế", "USER", "12345678");
        User tung = ensureUser("Ngô Đức Tùng", "tung@studynet.com", "ĐH Công nghệ", "Khoa học dữ liệu", "USER", "12345678");
        User thao = ensureUser("Nguyễn Phương Thảo", "thao@studynet.com", "ĐH Y Dược", "Công nghệ sinh học", "USER", "12345678");
        User phuc = ensureUser("Trịnh Gia Phúc", "phuc@studynet.com", "ĐH Giao thông Vận tải", "Kỹ thuật cơ điện tử", "USER", "12345678");
        User mai = ensureUser("Lý Mai Anh", "mai@studynet.com", "Học viện Ngân hàng", "Kế toán", "USER", "12345678");
        User khoa = ensureUser("Bùi Đăng Khoa", "khoa@studynet.com", "ĐH Sư phạm Hà Nội", "Sư phạm Toán", "USER", "12345678");
        User quynh = ensureUser("Trần Ngọc Quỳnh", "quynh@studynet.com", "ĐH Hà Nội", "Ngôn ngữ Anh", "USER", "12345678");
        User longUser = ensureUser("Phạm Hoàng Long", "long@studynet.com", "ĐH FPT", "Kỹ thuật phần mềm", "USER", "12345678");

        Group chemistryGroup = ensureGroup("Phòng Lab Hóa học", "Nhóm chia sẻ báo cáo thí nghiệm, kiến thức hóa vô cơ và hữu cơ.", minh, chemistry);
        Group englishGroup = ensureGroup("English For Study", "Luyện kỹ năng đọc tài liệu học thuật và thuyết trình bằng tiếng Anh.", huong, english);
        Group algorithmsGroup = ensureGroup("Thuật toán từ cơ bản đến nâng cao", "Nơi luyện LeetCode, cấu trúc dữ liệu và phỏng vấn kỹ thuật.", an, programming);
        Group mathGroup = ensureGroup("Bứt tốc Giải tích 1", "Tổng hợp bài tập giới hạn, đạo hàm và tích phân cho sinh viên năm nhất.", khoa, math);
        Group statisticsGroup = ensureGroup("Xác suất thống kê dễ hiểu", "Ôn tập xác suất, biến ngẫu nhiên và bài tập có lời giải từng bước.", binh, math);
        Group oopGroup = ensureGroup("OOP Java từ nền tảng", "Luyện OOP, design pattern cơ bản và các bài lab Java hướng đối tượng.", longUser, programming);
        Group webGroup = ensureGroup("Web Dev Study Hub", "Trao đổi React, Spring Boot, REST API và triển khai đồ án web.", tung, programming);
        Group pythonGroup = ensureGroup("Python ứng dụng cho sinh viên", "Chia sẻ notebook, xử lý dữ liệu và automation bằng Python.", tung, programming);
        Group physicsExamGroup = ensureGroup("Vật lý đại cương 1 - Luyện đề", "Kho đề cương, đề cũ và livestream chữa bài trước kỳ thi.", nam, physics);
        Group chemistryExamGroup = ensureGroup("Hóa hữu cơ ôn thi cuối kỳ", "Nơi hỏi đáp phản ứng, cơ chế và mẹo làm bài nhanh phần hữu cơ.", thao, chemistry);
        Group speakingGroup = ensureGroup("Speaking Club for Students", "Luyện speaking theo chủ đề học thuật, phản xạ và presentation.", quynh, english);
        Group readingGroup = ensureGroup("Reading Academic Papers", "Cùng nhau đọc paper, note từ vựng và kỹ thuật skim-scan.", huong, english);
        Group projectGroup = ensureGroup("Đồ án công nghệ thông tin K17", "Kết nối sinh viên làm đồ án, chia task và review tiến độ hàng tuần.", phuc, programming);
        Group calculusGroup = ensureGroup("Toán cao cấp cho dân kỹ thuật", "Tập trung đại số tuyến tính, giải tích nhiều biến và ứng dụng kỹ thuật.", khoa, math);
        Group internshipGroup = ensureGroup("CV - Phỏng vấn - Intern IT", "Chia sẻ kinh nghiệm viết CV, luyện phỏng vấn và săn thực tập IT.", longUser, programming);

        ensureMembership(minh, chemistryGroup, "GROUP_ADMIN");
        ensureMembership(huong, englishGroup, "GROUP_ADMIN");
        ensureMembership(an, algorithmsGroup, "GROUP_ADMIN");
        ensureMembership(an, englishGroup, "MEMBER");
        ensureMembership(binh, chemistryGroup, "MEMBER");
        ensureMembership(nam, algorithmsGroup, "MEMBER");
        ensureMembership(huong, algorithmsGroup, "MEMBER");
        ensureMembership(khoa, mathGroup, "GROUP_ADMIN");
        ensureMembership(binh, statisticsGroup, "GROUP_ADMIN");
        ensureMembership(longUser, oopGroup, "GROUP_ADMIN");
        ensureMembership(tung, webGroup, "GROUP_ADMIN");
        ensureMembership(tung, pythonGroup, "GROUP_ADMIN");
        ensureMembership(nam, physicsExamGroup, "GROUP_ADMIN");
        ensureMembership(thao, chemistryExamGroup, "GROUP_ADMIN");
        ensureMembership(quynh, speakingGroup, "GROUP_ADMIN");
        ensureMembership(huong, readingGroup, "GROUP_ADMIN");
        ensureMembership(phuc, projectGroup, "GROUP_ADMIN");
        ensureMembership(khoa, calculusGroup, "GROUP_ADMIN");
        ensureMembership(longUser, internshipGroup, "GROUP_ADMIN");
        ensureMembership(an, oopGroup, "MEMBER");
        ensureMembership(an, webGroup, "MEMBER");
        ensureMembership(binh, chemistryExamGroup, "MEMBER");
        ensureMembership(binh, mathGroup, "MEMBER");
        ensureMembership(huong, speakingGroup, "MEMBER");
        ensureMembership(huong, readingGroup, "MEMBER");
        ensureMembership(minh, chemistryExamGroup, "MEMBER");
        ensureMembership(nam, physicsExamGroup, "MEMBER");
        ensureMembership(lan, speakingGroup, "MEMBER");
        ensureMembership(lan, readingGroup, "MEMBER");
        ensureMembership(mai, statisticsGroup, "MEMBER");
        ensureMembership(mai, mathGroup, "MEMBER");
        ensureMembership(quynh, englishGroup, "MEMBER");
        ensureMembership(longUser, projectGroup, "MEMBER");
        ensureMembership(phuc, webGroup, "MEMBER");
        ensureMembership(tung, algorithmsGroup, "MEMBER");
        ensureMembership(thao, chemistryGroup, "MEMBER");
        ensureMembership(khoa, calculusGroup, "MEMBER");

        Post postOne = ensurePost(
            huong,
            englishGroup,
            english,
            "MATERIAL",
            "Mình vừa tổng hợp một bộ template viết email xin tài liệu từ giảng viên bằng tiếng Anh. Bạn nào cần mình sẽ đăng file vào nhóm."
        );
        Post postTwo = ensurePost(
            minh,
            chemistryGroup,
            chemistry,
            "DISCUSSION",
            "Mọi người có mẹo nào để nhớ dãy phản ứng este hóa nhanh hơn không? Mình đang ôn cho bài kiểm tra tuần tới."
        );
        Post postThree = ensurePost(
            an,
            algorithmsGroup,
            programming,
            "QUESTION",
            "Có ai muốn lập team ôn thuật toán tối nay không? Mình đang bí phần graph và shortest path."
        );
        Post postFour = ensurePost(
            nam,
            null,
            physics,
            "ANNOUNCEMENT",
            "Tối mai mình sẽ livestream chữa đề Vật lý đại cương trên nhóm, bạn nào cần thì nhớ bật thông báo nhé."
        );

        ensureReaction(postOne, an, "LIKE");
        ensureReaction(postOne, binh, "HEART");
        ensureReaction(postTwo, huong, "LIKE");
        ensureReaction(postThree, nam, "WOW");
        ensureReaction(postThree, huong, "LIKE");
        ensureReaction(postFour, an, "LIKE");

        ensureComment(postOne, an, "Hay quá, đúng thứ mình đang cần để làm seminar.");
        ensureComment(postTwo, binh, "Mình hay chia theo nhóm chức, lát nữa mình gửi sơ đồ cho bạn.");
        ensureComment(postThree, huong, "Mình tham gia, 8h tối mình online.");
        ensureComment(postFour, binh, "Nhớ gửi link cho mình với nhé.");
        ensurePost(khoa, mathGroup, math, "MATERIAL", "Mình vừa soạn bộ bài tập Giải tích 1 kèm lời giải ngắn gọn để mọi người ôn giữa kỳ.");
        ensurePost(longUser, oopGroup, programming, "DISCUSSION", "Có bạn nào muốn cùng refactor project Java theo MVC để luyện code sạch không?");
        ensurePost(tung, webGroup, programming, "QUESTION", "Mọi người đang deploy Spring Boot + React miễn phí bằng nền tảng nào ổn nhất hiện nay?");
        ensurePost(quynh, speakingGroup, english, "ANNOUNCEMENT", "Tối thứ 5 nhóm mình sẽ có buổi mock presentation 15 phút cho từng bạn.");
        ensurePost(nam, physicsExamGroup, physics, "MATERIAL", "Mình đã gom 3 đề cuối kỳ Vật lý đại cương có đáp án để mọi người tải về.");

    }

    private void repairExistingData() {
        List<Subject> subjects = subjectRepository.findAll();
        Map<String, Subject> subjectByCode = new HashMap<>();
        for (Subject subject : subjects) {
            subjectByCode.put(subject.getCode(), subject);
        }

        List<Group> groups = groupRepository.findAll();
        boolean groupsChanged = false;
        for (Group group : groups) {
            if (group.getSubject() != null) {
                continue;
            }

            Subject mappedSubject = inferGroupSubject(group.getName(), subjectByCode);
            if (mappedSubject != null) {
                group.setSubject(mappedSubject);
                groupsChanged = true;
            }
        }
        if (groupsChanged) {
            groupRepository.saveAll(groups);
        }

        List<Post> posts = postRepository.findAll();
        boolean postsChanged = false;
        for (Post post : posts) {
            if (post.getType() == null || post.getType().isBlank()) {
                post.setType(inferPostType(post.getContent()));
                postsChanged = true;
            }
        }
        if (postsChanged) {
            postRepository.saveAll(posts);
        }

        List<GroupMember> members = groupMemberRepository.findAll();
        boolean membersChanged = false;
        for (GroupMember member : members) {
            if (member.getMembershipStatus() == null || member.getMembershipStatus().isBlank()) {
                member.setMembershipStatus("APPROVED");
                membersChanged = true;
            }
        }
        if (membersChanged) {
            groupMemberRepository.saveAll(members);
        }

        List<Notification> notifications = notificationRepository.findAll();
        boolean notificationsChanged = false;
        for (Notification notification : notifications) {
            if (notification.getIsRead() == null) {
                notification.setIsRead(false);
                notificationsChanged = true;
            }
        }
        if (notificationsChanged) {
            notificationRepository.saveAll(notifications);
        }
    }

    private Subject inferGroupSubject(String groupName, Map<String, Subject> subjectByCode) {
        String normalized = groupName.toLowerCase();
        if (normalized.contains("java") || normalized.contains("lập trình")) {
            return subjectByCode.get("CS");
        }
        if (normalized.contains("vật lý")) {
            return subjectByCode.get("PHYS");
        }
        if (normalized.contains("giải tích") || normalized.contains("xác suất") || normalized.contains("toán")) {
            return subjectByCode.get("MATH");
        }
        return null;
    }

    private String inferPostType(String content) {
        String normalized = content == null ? "" : content.toLowerCase();
        if (normalized.contains("ai có") || normalized.contains("?")) {
            return "QUESTION";
        }
        if (normalized.contains("chia sẻ") || normalized.contains("tài liệu") || normalized.contains("ghi chú")) {
            return "MATERIAL";
        }
        if (normalized.contains("buổi") || normalized.contains("thông báo")) {
            return "ANNOUNCEMENT";
        }
        return "DISCUSSION";
    }

    private Subject createSubject(String name, String code) {
        Subject subject = new Subject();
        subject.setName(name);
        subject.setCode(code);
        return subject;
    }

    private User createUser(String fullName, String email, String school, String major, String role, String rawPassword) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setSchool(school);
        user.setMajor(major);
        user.setRole(role);
        user.setPassword(passwordEncoder.encode(rawPassword));
        return user;
    }

    private Group createGroup(String name, String description, User creator, Subject subject) {
        Group group = new Group();
        group.setName(name);
        group.setDescription(description);
        group.setCreator(creator);
        group.setSubject(subject);
        return group;
    }

    private GroupMember createGroupMember(User user, Group group, String role) {
        GroupMember member = new GroupMember();
        member.setUser(user);
        member.setGroup(group);
        member.setRole(role);
        member.setMembershipStatus("APPROVED");
        return member;
    }

    private Post createPost(User user, Group group, Subject subject, String type, String content) {
        Post post = new Post();
        post.setUser(user);
        post.setGroup(group);
        post.setSubject(subject);
        post.setType(type);
        post.setContent(content);
        return post;
    }

    private Reaction createReaction(Post post, User user, String type) {
        Reaction reaction = new Reaction();
        reaction.setPost(post);
        reaction.setUser(user);
        reaction.setType(type);
        return reaction;
    }

    private Comment createComment(Post post, User user, String content) {
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(content);
        return comment;
    }

    private Subject findSubject(String code) {
        return subjectRepository.findAll().stream()
            .filter(subject -> code.equals(subject.getCode()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy subject " + code));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user " + email));
    }

    private User ensureUser(String fullName, String email, String school, String major, String role, String rawPassword) {
        return userRepository.findByEmail(email).orElseGet(() -> userRepository.save(createUser(fullName, email, school, major, role, rawPassword)));
    }

    private Group ensureGroup(String name, String description, User creator, Subject subject) {
        return groupRepository.findByNameContainingIgnoreCase(name).stream()
            .filter(group -> group.getName().equalsIgnoreCase(name))
            .findFirst()
            .orElseGet(() -> groupRepository.save(createGroup(name, description, creator, subject)));
    }

    private void ensureMembership(User user, Group group, String role) {
        Optional<GroupMember> existing = groupMemberRepository.findByUserIdAndGroupId(user.getId(), group.getId());
        if (existing.isEmpty()) {
            groupMemberRepository.save(createGroupMember(user, group, role));
        }
    }

    private Post ensurePost(User user, Group group, Subject subject, String type, String content) {
        return postRepository.findAll().stream()
            .filter(post -> post.getUser().getId().equals(user.getId()) && content.equals(post.getContent()))
            .findFirst()
            .orElseGet(() -> postRepository.save(createPost(user, group, subject, type, content)));
    }

    private void ensureReaction(Post post, User user, String type) {
        if (reactionRepository.findByPostIdAndUserId(post.getId(), user.getId()).isEmpty()) {
            reactionRepository.save(createReaction(post, user, type));
        }
    }

    private void ensureComment(Post post, User user, String content) {
        boolean exists = commentRepository.findByPostIdOrderByCreatedAtAsc(post.getId()).stream()
            .anyMatch(comment -> comment.getUser().getId().equals(user.getId()) && content.equals(comment.getContent()));
        if (!exists) {
            commentRepository.save(createComment(post, user, content));
        }
    }

}
